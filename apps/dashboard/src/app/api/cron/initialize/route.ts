import { NextResponse } from "next/server";
import { ensureLowStockCron } from "@/lib/lowStockCron";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    ensureLowStockCron();
    return NextResponse.json({
      ok: true,
      message: "Cron jobs initialized successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron-initialize] Failed to initialize cron jobs", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to initialize cron jobs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
