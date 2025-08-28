"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@stockholm/db";
import { z } from "zod";
import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { bumpLowStockBadge } from "@/lib/lowStock";

const ItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().int().nonnegative(),
  location: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).default(0),
  tags: z.string().optional().nullable(), // comma separated
});

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8MB (align with next.config.ts)
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

async function savePhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED.has(file.type)) throw new Error("Only JPG/PNG/WEBP allowed");
  if (file.size > MAX_SIZE) throw new Error("Max file size 8MB");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const name = `${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
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

    // handle optional photo upload from field name "image"
    const photo = form.get("image") as File | null;
    const photoUrl = await savePhoto(photo);

    const inserted = await db.item.create({
      data: {
        name: parsed.name,
        sku: parsed.sku ?? null,
        quantity: parsed.quantity,
        location: parsed.location ?? null,
        condition: parsed.condition ?? null,
        lowStockThreshold: parsed.lowStockThreshold,
        tags: tagsArray,
        photoUrl: photoUrl ?? null,
      },
      select: { id: true },
    });

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

export async function updateQuantity(id: string, qty: number) {
  await db.item.update({ where: { id }, data: { quantity: qty } });
  bumpLowStockBadge();
  revalidateTag("low-stock");
  revalidatePath("/app/items");
}

async function removeFileIfExists(publicUrl: string | null) {
  if (!publicUrl) return;
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
  await db.item.delete({ where: { id } });
  await removeFileIfExists(row?.photoUrl ?? null);
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
