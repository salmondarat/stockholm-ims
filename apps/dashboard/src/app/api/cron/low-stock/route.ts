import { NextResponse } from "next/server";
import { db } from "@stockholm/db";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Middleware sederhana: cek Authorization: Bearer <TOKEN>
 * - Jika kamu hanya menjalankan di localhost (dev), kamu boleh melewatkan header ini.
 *   (lihat logika isLocal below)
 */
function isAuthorized(req: Request) {
  const url = new URL(req.url);
  const host = url.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "::1";

  // izinkan tanpa token saat akses lokal (opsional; kalau tidak mau, hapus block ini)
  if (isLocal) return true;

  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const provided = match?.[1];

  return provided && provided === process.env.LOW_STOCK_CRON_TOKEN;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await db.item.findMany();
  const lows = rows.filter(
    (x) =>
      (x.lowStockThreshold ?? 0) > 0 &&
      x.quantity <= (x.lowStockThreshold ?? 0),
  );

  // TODO: kirimkan notifikasi di sini kalau mau (email/telegram/slack)
  // await notify(lows);

  // segarkan badge low-stock (cache tag)
  revalidateTag("low-stock");

  return NextResponse.json({
    ok: true,
    lowStockCount: lows.length,
    itemIds: lows.map((i) => i.id),
    ts: new Date().toISOString(),
  });
}
