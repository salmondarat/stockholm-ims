import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Basic health check endpoint for storage config
  const s3Configured = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
  return NextResponse.json({ ok: true, s3Configured });
}
