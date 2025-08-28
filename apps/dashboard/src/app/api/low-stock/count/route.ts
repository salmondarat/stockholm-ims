import { NextResponse } from "next/server";
import { getLowStockCountCached } from "@/lib/lowStock";

export const dynamic = "force-dynamic"; // jaminan fresh fetch (di luar caching layer Next)
export const runtime = "nodejs";

export async function GET() {
  const count = await getLowStockCountCached();
  return NextResponse.json(
    { ok: true, count, ts: new Date().toISOString() },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
