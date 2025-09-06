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
  if (!parsed.success) {
    // cetak error agar build gagal cepat
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = readEnv();
