"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@stockholm/db";
import { z } from "zod";
import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { bumpLowStockBadge } from "@/lib/lowStock";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

const numberNonNegative = z.preprocess(
  (v) => (v === "" || v == null ? 0 : v),
  z.coerce.number().int().min(0)
);

const numberMoney = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0).optional()
);

const ItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  quantity: numberNonNegative, // handles empty -> 0
  location: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  lowStockThreshold: numberNonNegative.default(0), // handles empty -> 0
  tags: z.string().optional().nullable(), // comma separated
  price: numberMoney, // optional price
  categoryId: z.string().uuid().optional().or(z.literal("")).optional(),
  options: z.string().optional().nullable(), // JSON text
});

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8MB (align with next.config.ts)
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

// S3/MinIO config
const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "";
const S3_REGION = process.env.S3_REGION ?? "us-east-1";
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? "";
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY ?? "";
const S3_BUCKET = process.env.S3_BUCKET ?? "";
const S3_FORCE_PATH_STYLE =
  (process.env.S3_FORCE_PATH_STYLE ?? "true").toLowerCase() === "true";

const s3Enabled = Boolean(
  S3_ENDPOINT && S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY
);

let s3: S3Client | null = null;
let bucketEnsured = false;
function getS3() {
  if (!s3Enabled) return null;
  if (!s3) {
    s3 = new S3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      forcePathStyle: S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

async function ensureBucketOnce() {
  if (!s3Enabled || bucketEnsured) return;
  const client = getS3();
  if (!client) return;
  try {
    // Best-effort: try to create bucket; ignore if exists
    await client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
  } catch {
    // ignore BucketAlreadyOwnedByYou or already exists
  } finally {
    bucketEnsured = true;
  }
}

function publicS3UrlForKey(key: string) {
  const base = S3_ENDPOINT.replace(/\/$/, "");
  if (S3_FORCE_PATH_STYLE) return `${base}/${S3_BUCKET}/${key}`;
  // virtual-host style (not typical for MinIO dev)
  try {
    const u = new URL(base);
    return `${u.protocol}//${S3_BUCKET}.${u.host}/${key}`;
  } catch {
    return `${base}/${S3_BUCKET}/${key}`;
  }
}

type StorageTarget = "local" | "s3" | undefined;

async function savePhoto(
  file: File | null,
  target: StorageTarget
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED.has(file.type)) throw new Error("Only JPG/PNG/WEBP allowed");
  if (file.size > MAX_SIZE) throw new Error("Max file size 8MB");

  const ext =
    (() => {
      const fromName = (file.name.split(".").pop() || "").toLowerCase();
      if (ALLOWED_EXT.has(fromName)) return fromName;
      if (file.type === "image/png") return "png";
      if (file.type === "image/webp") return "webp";
      return "jpg";
    })();
  const name = `${crypto.randomUUID()}.${ext}`;

  // Decide target storage based on user preference and availability
  const preferS3 = target === "s3";
  const preferLocal = target === "local";

  // Prefer S3/MinIO when chosen or when not specified (back-compat), and configured
  if (s3Enabled && (preferS3 || (!preferLocal && target === undefined))) {
    await ensureBucketOnce();
    const client = getS3();
    const key = `items/${name}`;
    const body = Buffer.from(await file.arrayBuffer());
    await client!.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type || "image/jpeg",
      })
    );
    return publicS3UrlForKey(key);
  }

  // Fallback: local filesystem under public/uploads
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

async function savePhotos(
  files: File[],
  target: StorageTarget
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const u = await savePhoto(file, target);
    if (u) urls.push(u);
  }
  return urls;
}

// createItemAction below is the canonical create handler

export type CreateItemState = {
  ok: boolean;
  id?: string;
  error?: string;
};

export async function createItemAction(
  _prev: CreateItemState,
  form: FormData
): Promise<CreateItemState> {
  try {
    const parsed = ItemSchema.parse({
      name: form.get("name"),
      sku: form.get("sku"),
      quantity: form.get("quantity"),
      location: form.get("location"),
      condition: form.get("condition"),
      lowStockThreshold: form.get("lowStockThreshold"),
      tags: form.get("tags"),
      price: form.get("price"),
      categoryId: form.get("categoryId"),
      options: form.get("options"),
    });

    const tagsArray =
      typeof parsed.tags === "string"
        ? Array.from(
            new Set(
              parsed.tags
                .split(/[,\n]/g) // koma atau baris baru
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => s.toLowerCase())
            )
          ).slice(0, 20) // batasi jumlah tag (opsional)
        : null;

    // Handle file (opsional, kalau kamu pakai MinIO + sharp)
    // const file = form.get("image") as unknown as File | null;
    // let imageUrl: string | null = null;
    // let thumbnailUrl: string | null = null;
    // if (file && typeof file === "object") {
    //   const buf = Buffer.from(await file.arrayBuffer());
    //   const ext = (file.type?.split("/")?.[1] ?? "jpg").toLowerCase();
    //   const id = randomUUID();
    //   const baseKey = `items/${id}`;
    //   imageUrl = await putObjectRaw({
    //     key: `${baseKey}.${ext}`,
    //     contentType: file.type || "image/jpeg",
    //     body: buf,
    //   });
    //   const thumb = await sharp(buf).resize(480, 480, { fit: "inside" }).jpeg({ quality: 82 }).toBuffer();
    //   thumbnailUrl = await putObjectRaw({
    //     key: `${baseKey}.thumb.jpg`,
    //     contentType: "image/jpeg",
    //     body: thumb,
    //   });
    // }

    // handle optional media via two paths:
    // - direct-to-s3: client uploads and sends one or more `mediaKey`
    // - server-handled: client sends multiple `images` and we upload here
    const storageRaw = (form.get("photoStorage") as string | null) || undefined;
    const storage: StorageTarget =
      storageRaw === "s3" ? "s3" : storageRaw === "local" ? "local" : undefined;

    const mediaUrls: string[] = [];
    if (storage === "s3") {
      const keys = form.getAll("mediaKey").map((x) => String(x)).filter(Boolean);
      for (const key of keys) mediaUrls.push(publicS3UrlForKey(key));
    } else {
      // local or server-side S3 upload
      const files = (form.getAll("images") as unknown as File[]).filter(Boolean);
      const urls = await savePhotos(files, storage);
      mediaUrls.push(...urls);
    }

    // Parse options JSON if provided
    let optionsJson: unknown = undefined;
    if (typeof parsed.options === "string" && parsed.options.trim()) {
      try {
        optionsJson = JSON.parse(parsed.options);
      } catch {
        // ignore invalid JSON
      }
    }

    const inserted = await db.item.create({
      data: {
        name: parsed.name,
        sku: parsed.sku ?? null,
        quantity: parsed.quantity,
        location: parsed.location ?? null,
        condition: parsed.condition ?? null,
        lowStockThreshold: parsed.lowStockThreshold,
        tags: tagsArray ?? undefined,
        price: parsed.price ?? null,
        categoryId: parsed.categoryId && parsed.categoryId.length ? parsed.categoryId : null,
        options: optionsJson as any,
        // keep first media as legacy photoUrl for list view
        photoUrl: mediaUrls[0] ?? null,
      },
      select: { id: true },
    });

    // insert media rows
    if (mediaUrls.length) {
      await (db as any).itemMedia.createMany({
        data: mediaUrls.map((url, idx) => ({ itemId: inserted.id, url, position: idx })),
      });
    }

    // Segarkan list & badge low-stock
    revalidatePath("/app/items");
    revalidateTag("low-stock");

    return { ok: true, id: inserted?.id };
  } catch (e) {
    if (e instanceof Error) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Failed to create item" };
  }
}

// UPDATE ITEM
export type UpdateItemState = {
  ok: boolean;
  id?: string;
  error?: string;
};

export async function updateItemAction(
  _prev: UpdateItemState,
  form: FormData
): Promise<UpdateItemState> {
  try {
    const id = String(form.get("id") || "");
    if (!id) return { ok: false, error: "Missing item id" };

    const parsed = ItemSchema.parse({
      name: form.get("name"),
      sku: form.get("sku"),
      quantity: form.get("quantity"),
      location: form.get("location"),
      condition: form.get("condition"),
      lowStockThreshold: form.get("lowStockThreshold"),
      tags: form.get("tags"),
      price: form.get("price"),
      categoryId: form.get("categoryId"),
      options: form.get("options"),
    });

    const tagsArray =
      typeof parsed.tags === "string"
        ? Array.from(
            new Set(
              parsed.tags
                .split(/[,\n]/g)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => s.toLowerCase())
            )
          ).slice(0, 20)
        : null;

    const storageRaw = (form.get("photoStorage") as string | null) || undefined;
    const storage: StorageTarget =
      storageRaw === "s3" ? "s3" : storageRaw === "local" ? "local" : undefined;

    // media adds
    const mediaUrls: string[] = [];
    if (storage === "s3") {
      const keys = form.getAll("mediaKey").map((x) => String(x)).filter(Boolean);
      for (const key of keys) mediaUrls.push(publicS3UrlForKey(key));
    } else {
      const files = (form.getAll("images") as unknown as File[]).filter(Boolean);
      const urls = await savePhotos(files, storage);
      mediaUrls.push(...urls);
    }

    // media removals
    const removeIds = form.getAll("removeMediaId").map((x) => String(x)).filter(Boolean);
    // ordering and cover
    const orderIds = form.getAll("orderMediaId").map((x) => String(x)).filter(Boolean);
    const coverMediaId = (form.get("coverMediaId") as string | null) || null;

    // Apply all media operations atomically
    await db.$transaction(async (tx) => {
      // Parse options JSON if provided
      let optionsJson: unknown = undefined;
      if (typeof parsed.options === "string") {
        const str = parsed.options.trim();
        if (str) {
          try {
            optionsJson = JSON.parse(str);
          } catch {
            optionsJson = undefined; // ignore invalid
          }
        } else {
          optionsJson = null; // empty clears
        }
      }
      const existing = await tx.item.findUnique({ where: { id }, select: { photoUrl: true } });
      // Update fields
      await tx.item.update({
        where: { id },
        data: {
          name: parsed.name,
          sku: parsed.sku ?? null,
          quantity: parsed.quantity,
          location: parsed.location ?? null,
          condition: parsed.condition ?? null,
          lowStockThreshold: parsed.lowStockThreshold,
          tags: tagsArray ?? undefined,
          price: parsed.price ?? null,
          categoryId: parsed.categoryId && parsed.categoryId.length ? parsed.categoryId : null,
          options: optionsJson as any,
        },
      });

      // Delete selected media
      for (const mid of removeIds) {
        await (tx as any).itemMedia.deleteMany({ where: { id: mid, itemId: id } });
      }

      // Insert new media appended at the end
      const currentCount = await (tx as any).itemMedia.count({ where: { itemId: id } });
      if (mediaUrls.length) {
        await (tx as any).itemMedia.createMany({
          data: mediaUrls.map((url, idx) => ({ id: crypto.randomUUID(), itemId: id, url, position: currentCount + idx })),
        });
      }

      // Apply explicit ordering if provided (excluding removed)
      if (orderIds.length) {
        for (let i = 0; i < orderIds.length; i++) {
          const mid = orderIds[i];
          if (removeIds.includes(mid)) continue;
          await (tx as any).itemMedia.update({ where: { id: mid }, data: { position: i } });
        }
      }

      // Recompute primary photoUrl from remaining media (or new additions)
      let photoUrl: string | null = null;
      if (coverMediaId) {
        const cover = (await (tx as any).itemMedia.findUnique({ where: { id: coverMediaId }, select: { url: true } })) as { url: string } | null;
        photoUrl = cover?.url ?? null;
      } else {
        const first = (await (tx as any).itemMedia.findFirst({
          where: { itemId: id },
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          select: { url: true },
        })) as { url: string } | null;
        photoUrl = first?.url ?? existing?.photoUrl ?? null;
      }
      await tx.item.update({ where: { id }, data: { photoUrl } });
    });

    bumpLowStockBadge();
    revalidateTag("low-stock");
    revalidatePath("/app/items");
    revalidatePath(`/app/items/${id}`);
    revalidatePath(`/app/items/${id}/edit`);

    return { ok: true, id };
  } catch (e) {
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: "Failed to update item" };
  }
}

export async function updateQuantity(id: string, qty: number) {
  const safeQty = Math.max(0, Number.isFinite(qty) ? Math.floor(qty) : 0);
  await db.item.update({ where: { id }, data: { quantity: safeQty } });
  bumpLowStockBadge();
  revalidateTag("low-stock");
  revalidatePath("/app/items");
}

async function removeFileIfExists(publicUrl: string | null) {
  if (!publicUrl) return;
  // If S3 URL, try to delete object
  const base = S3_ENDPOINT.replace(/\/$/, "");
  if (s3Enabled && publicUrl.startsWith(`${base}/${S3_BUCKET}/`)) {
    const key = publicUrl.substring(`${base}/${S3_BUCKET}/`.length);
    try {
      await getS3()!.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })
      );
      return;
    } catch {
      // ignore and try local fallback
    }
  }
  // Local file fallback
  const abs = path.join(process.cwd(), "public", publicUrl.replace(/^\/+/, ""));
  try {
    await stat(abs);
    await unlink(abs);
  } catch {
    /* ignore */
  }
}

export async function deleteItem(id: string) {
  const row = await db.item.findUnique({ where: { id } });
  const media = (await (db as any).itemMedia.findMany({
    where: { itemId: id },
    select: { url: true },
  })) as Array<{ url: string }>;
  await db.item.delete({ where: { id } });
  await removeFileIfExists(row?.photoUrl ?? null);
  for (const m of media) {
    await removeFileIfExists(m.url);
  }
  bumpLowStockBadge();
  revalidateTag("low-stock");
  revalidatePath("/app/items");
}

export async function getLowStock() {
  // Prisma cannot filter with column-to-column comparison; use raw SQL
  const rows = await db.$queryRaw<any[]>`
    SELECT * FROM "items" WHERE "quantity" <= "low_stock_threshold"
  `;
  return rows;
}
