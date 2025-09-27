// packages/config/src/env.ts
import { z } from "zod";

// Server-only variables (TIDAK diexpose ke browser)
// Catatan: Beberapa variabel dibuat opsional supaya app tetap bisa berjalan
// walau fitur terkait (mis. S3/cron) tidak digunakan.
const ServerEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),

  // Cron guard (opsional)
  LOW_STOCK_CRON_TOKEN: z.string().min(16).optional(),

  // S3/MinIO (opsional)
  S3_ENDPOINT: z.string().url().optional(), // ex: http://localhost:9000
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_FORCE_PATH_STYLE: z
    .union([z.literal("true"), z.literal("false")])
    .default("true"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

function readEnv(): ServerEnv {
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (parsed.success) {
    return parsed.data;
  }

  const shouldSoftFail =
    process.env.SKIP_ENV_VALIDATION === "1" ||
    process.env.SKIP_ENV_VALIDATION === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.NEXT_PHASE === "phase-production-build");

  if (shouldSoftFail) {
    console.warn(
      "⚠️  Skipping strict env validation for build phase:",
      parsed.error.flatten().fieldErrors,
    );

    const fallbackEnv: ServerEnv = {
      NODE_ENV:
        process.env.NODE_ENV === "production"
          ? "production"
          : process.env.NODE_ENV === "test"
            ? "test"
            : "development",
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/stockholm",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "development-nextauth-secret-development",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      LOW_STOCK_CRON_TOKEN: process.env.LOW_STOCK_CRON_TOKEN,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_REGION: process.env.S3_REGION ?? "us-east-1",
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_FORCE_PATH_STYLE:
        process.env.S3_FORCE_PATH_STYLE === "false" ? "false" : "true",
    };

    // In production, don't fallback required vars - throw to force config
    if (process.env.NODE_ENV === "production") {
      if (!fallbackEnv.DATABASE_URL.startsWith('postgresql://') && !fallbackEnv.DATABASE_URL.includes('@')) {
        throw new Error("Production DATABASE_URL must be a real remote DB, not fallback.");
      }
      if (!fallbackEnv.NEXTAUTH_SECRET || fallbackEnv.NEXTAUTH_SECRET.length < 32) {
        throw new Error("Production NEXTAUTH_SECRET must be set and strong.");
      }
      if (!fallbackEnv.NEXTAUTH_URL.startsWith('https://')) {
        throw new Error("Production NEXTAUTH_URL must be HTTPS production URL.");
      }
    }

    return fallbackEnv;
  }

  // cetak error agar build gagal cepat
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  console.error("Missing or invalid vars:", Object.keys(parsed.error.flatten().fieldErrors || {}));
  console.error("Available env keys during build:", Object.keys(process.env).slice(0, 20)); // First 20 to avoid log flood
  console.error("NEXT_PHASE:", process.env.NEXT_PHASE);
  console.error("NODE_ENV:", process.env.NODE_ENV);
  throw new Error("Invalid environment variables");
}

export const env = readEnv();
