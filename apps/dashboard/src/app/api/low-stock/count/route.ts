import { NextResponse } from "next/server";
import { getLowStockCountCached } from "@/lib/lowStock";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic"; // jaminan fresh fetch (di luar caching layer Next)
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const count = await getLowStockCountCached();
  return NextResponse.json(
    { ok: true, count, ts: new Date().toISOString() },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
