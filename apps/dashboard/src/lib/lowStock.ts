"use server";

import { db } from "@stockholm/db";
import { unstable_cache, revalidateTag } from "next/cache";

/**
 * Hitung jumlah item low-stock (quantity <= threshold, threshold > 0).
 */
export async function getLowStockCount(): Promise<number> {
  const rows = await db.item.findMany({
    select: { quantity: true, lowStockThreshold: true },
  });
  return rows.filter((r) => (r.lowStockThreshold ?? 0) > 0 && r.quantity <= (r.lowStockThreshold ?? 0)).length;
}

/**
 * Versi cached selama 60 detik + bisa di-revalidate lewat tag 'low-stock'.
 */
export const getLowStockCountCached = unstable_cache(
  async () => await getLowStockCount(),
  ["low-stock-count"],
  { revalidate: 60, tags: ["low-stock"] }
);

/** Panggil ini dari Server Action CRUD items agar badge langsung update */
export async function bumpLowStockBadge() {
  revalidateTag("low-stock");
}
