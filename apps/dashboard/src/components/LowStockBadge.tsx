"use client";

import { useEffect, useState } from "react";

export default function LowStockBadgeClient() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/low-stock/count", { cache: "no-store" });
        const json = await res.json();
        if (alive) setCount(json.count ?? 0);
      } catch {
        // noop
      }
    };

    load();
    const id = setInterval(load, 30_000); // refresh tiap 30 detik
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-white text-xs">
      {count ?? "…"}
    </span>
  );
}
