// apps/dashboard/src/app/api/uploads/presign/route.ts
import { NextResponse } from "next/server";
import { PutObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3, isS3Enabled } from "@/lib/s3";
import { env } from "@stockholm/config/env";
import { auth } from "@/lib/auth";
import { randomUUID } from "node:crypto";

import { z } from "zod";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

const BodySchema = z.object({
  contentType: z.string().min(3), // e.g. "image/jpeg"
  ext: z
    .string()
    .regex(/^[a-z0-9]+$/i)
    .default("bin"), // file extension (optional)
});

export async function POST(req: Request) {
  try {
    // Require authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure S3 is configured
    if (!isS3Enabled() || !env.S3_BUCKET) {
      return new NextResponse("S3 not configured", { status: 503 });
    }
    const json = await req.json();
    const { contentType, ext } = BodySchema.parse(json);

    if (!ALLOWED_MIME.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported media type" },
        { status: 400 },
      );
    }
    if (!ALLOWED_EXT.has(ext.toLowerCase())) {
      return NextResponse.json(
        { error: "Unsupported file extension" },
        { status: 400 },
      );
    }

    // generate unique key (mis: uploads/2025/08/uuid.ext)
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const uid = randomUUID();
    const key = `uploads/${y}/${m}/${d}/${uid}.${ext}`;

    // best-effort ensure bucket exists (MinIO dev friendliness)
    try {
      await getS3()!.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
    } catch {}

    const putCmd = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
      // (opsional) ACL untuk public-read kalau pakai gateway publik
      // ACL: "public-read",
    });

    const url = await getSignedUrl(getS3()!, putCmd, { expiresIn: 60 }); // 60s

    return NextResponse.json({ url, key });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
