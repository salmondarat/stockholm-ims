import { NextResponse } from "next/server";
import { runLowStockSweep } from "@/lib/lowStockCron";

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

  const result = await runLowStockSweep();

  // TODO: kirimkan notifikasi di sini kalau mau (email/telegram/slack)
  // await notify(result.itemIds);

  return NextResponse.json({
    ok: true,
    ...result,
    ts: new Date().toISOString(),
  });
}
