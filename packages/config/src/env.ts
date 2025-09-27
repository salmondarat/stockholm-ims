import { z } from "zod";

type NodeEnv = "development" | "test" | "production";

const RawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url().optional(),
  LOW_STOCK_CRON_TOKEN: z.string().min(16).optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.enum(["true", "false"]).default("true"),
});

type RawServerEnv = z.infer<typeof RawEnvSchema>;
export type ServerEnv = RawServerEnv & { NEXTAUTH_URL: string };

let warnedEnvFallback = false;

function deriveUrlFromVercel(): string | null {
  const candidate =
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    null;

  if (!candidate) return null;

  const normalized = candidate.startsWith("http")
    ? candidate
    : `https://${candidate}`;

  try {
    const url = new URL(normalized);
    return url.origin;
  } catch (error) {
    console.warn("⚠️  Unable to normalize candidate NEXTAUTH_URL", candidate, error);
    return null;
  }
}

function resolveNextAuthUrl(raw: RawServerEnv): string {
  if (raw.NEXTAUTH_URL) return raw.NEXTAUTH_URL;

  const derived = deriveUrlFromVercel();
  if (derived) return derived;

  if (raw.NODE_ENV === "development" || raw.NODE_ENV === "test") {
    return "http://localhost:3000";
  }

  throw new Error(
    "NEXTAUTH_URL is required in production. Set NEXTAUTH_URL or configure the Vercel project URL.",
  );
}

function finalizeEnv(raw: RawServerEnv): ServerEnv {
  return {
    ...raw,
    NEXTAUTH_URL: resolveNextAuthUrl(raw),
  };
}

function guessNodeEnv(): NodeEnv {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

function readEnv(): ServerEnv {
  const parsed = RawEnvSchema.safeParse(process.env);
  if (parsed.success) {
    return finalizeEnv(parsed.data);
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";

  const shouldSoftFail =
    !isProduction ||
    process.env.SKIP_ENV_VALIDATION === "1" ||
    process.env.SKIP_ENV_VALIDATION === "true" ||
    (!isProduction && process.env.NEXT_PHASE === "phase-production-build");

  if (shouldSoftFail) {
    if (!warnedEnvFallback) {
      console.warn(
        "⚠️  Skipping strict env validation:",
        parsed.error.flatten().fieldErrors,
      );
      warnedEnvFallback = true;
    }

    const fallbackEnv: RawServerEnv = {
      NODE_ENV: guessNodeEnv(),
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@localhost:5432/stockholm",
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ?? "development-nextauth-secret-development",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      LOW_STOCK_CRON_TOKEN: process.env.LOW_STOCK_CRON_TOKEN,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_REGION: process.env.S3_REGION ?? "us-east-1",
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_FORCE_PATH_STYLE:
        process.env.S3_FORCE_PATH_STYLE === "false" ? "false" : "true",
    };

    const safeEnv = finalizeEnv(fallbackEnv);

    if (isProduction) {
      const isLocalDb = /localhost|127\.0\.0\.1/.test(safeEnv.DATABASE_URL);
      if (isLocalDb) {
        throw new Error(
          "Production DATABASE_URL must point to a remote database.",
        );
      }
      if (!safeEnv.NEXTAUTH_SECRET || safeEnv.NEXTAUTH_SECRET.length < 32) {
        throw new Error(
          "Production NEXTAUTH_SECRET must be set and at least 32 characters.",
        );
      }
      if (!safeEnv.NEXTAUTH_URL.startsWith("https://")) {
        throw new Error(
          "Production NEXTAUTH_URL must be HTTPS.",
        );
      }
    }

    return safeEnv;
  }

  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  console.error(
    "Missing or invalid vars:",
    Object.keys(parsed.error.flatten().fieldErrors || {}),
  );
  console.error(
    "Available env keys during build:",
    Object.keys(process.env).slice(0, 20),
  );
  console.error("NEXT_PHASE:", process.env.NEXT_PHASE);
  console.error("NODE_ENV:", process.env.NODE_ENV);
  throw new Error("Invalid environment variables");
}

export const env = readEnv();
