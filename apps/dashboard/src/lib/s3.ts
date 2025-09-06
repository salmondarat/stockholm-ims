// apps/dashboard/src/lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@stockholm/config/env";

let client: S3Client | null = null;

function hasS3Config() {
  return Boolean(
    env.S3_ENDPOINT &&
      env.S3_BUCKET &&
      env.S3_ACCESS_KEY_ID &&
      env.S3_SECRET_ACCESS_KEY,
  );
}

export function isS3Enabled(): boolean {
  return hasS3Config();
}

export function getS3(): S3Client | null {
  if (!hasS3Config()) return null;
  if (!client) {
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}
