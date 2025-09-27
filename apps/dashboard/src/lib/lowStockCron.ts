import { db } from "@stockholm/db";
import { revalidateTag } from "next/cache";

type SweepResult = {
  lowStockCount: number;
  itemIds: string[];
};

async function sweepLowStock(): Promise<SweepResult> {
  const rows = await db.item.findMany({
    select: { id: true, quantity: true, lowStockThreshold: true },
  });

  const lows = rows.filter(
    (row) =>
      (row.lowStockThreshold ?? 0) > 0 &&
      row.quantity <= (row.lowStockThreshold ?? 0)
  );

  try {
    revalidateTag("low-stock");
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);
    if (!message.includes("static generation store missing")) {
      console.warn("[low-stock-cron] Failed to revalidate tag", error);
    }
  }

  return {
    lowStockCount: lows.length,
    itemIds: lows.map((row) => row.id),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __lowStockCronStarted: boolean | undefined;
}

export async function runLowStockSweep(): Promise<SweepResult> {
  return sweepLowStock();
}

export function ensureLowStockCron() {
  // Singleton pattern: only initialize once per Node.js process
  if (globalThis.__lowStockCronStarted) {
    console.log("[low-stock-cron] Cron already initialized, skipping");
    return;
  }

  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (isBuildPhase) {
    console.log(
      "[low-stock-cron] Build phase detected, skipping cron initialization"
    );
    return;
  }

  const isServerless = process.env.VERCEL === "1";

  if (isServerless) {
    console.log(
      "[low-stock-cron] Running on Vercel/immutable runtime, skip persistent interval",
    );
    return;
  }

  const rawInterval = process.env.LOW_STOCK_CRON_INTERVAL_MS;
  const intervalMs = (() => {
    if (!rawInterval) return 60 * 60 * 1000; // default: 1 hour
    const parsed = Number.parseInt(rawInterval, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60 * 60 * 1000;
  })();

  const shouldEnable = process.env.ENABLE_INTERNAL_CRON !== "false";
  if (!shouldEnable) {
    console.log("[low-stock-cron] Cron disabled via environment variable");
    return;
  }

  console.log(
    "[low-stock-cron] Initializing cron job with interval:",
    intervalMs,
    "ms"
  );
  globalThis.__lowStockCronStarted = true;

  const tick = async () => {
    try {
      await sweepLowStock();
    } catch (error) {
      console.error("[low-stock-cron] sweep failed", error);
    }
  };

  // Run immediately and then on interval
  tick();
  const timer = setInterval(tick, intervalMs);
  if (typeof timer.unref === "function") timer.unref();

  console.log("[low-stock-cron] Cron job initialized successfully");
}

export type { SweepResult };
