"use client";

import { useEffect, useRef, useState } from "react";
import { listVariantQuantities } from "@/lib/options";

type VariantRow = { attrs: Record<string, string>; qty: number; sku?: string };

export default function VariantDetailsToggle({
  variants,
  options,
  inline = false,
}: {
  variants?: VariantRow[];
  options?: unknown;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside or pressing ESC
  useEffect(() => {
    if (!open) return;
    const onPointer = (ev: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = ev.target as Node | null;
      if (target && !el.contains(target)) setOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const list: VariantRow[] = Array.isArray(variants) && variants.length
    ? variants
    : listVariantQuantities(options);
  if (!list.length) return null;
  return (
    // When not inline, render details as an overlay popover; in table (inline=true) ensure full-width block so width is consistent
    <div ref={rootRef} className={inline ? "block ml-0" : "relative mt-1"}>
      <button
        type="button"
        className={inline ? "text-[11px] underline text-gray-600 align-baseline" : "text-[11px] underline text-gray-600"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide variants" : "Show variants"}
      </button>
      {/* Inline mode renders a full-width panel so width is consistent across rows */}
      {inline ? (
        open && (
          <div className="mt-1 w-full rounded-md border bg-gray-50 dark:bg-neutral-900/40 p-2 space-y-1 break-words">
            {list.map((v, i) => (
              <div key={i} className="text-[11px] text-gray-600 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(v.attrs).map(([k, val]) => (
                    <span key={k + val} className="px-2 py-0.5 rounded-full border break-words">{k}: {val}</span>
                  ))}
                </div>
                <div className="ml-2 flex items-center gap-3">
                  <span>sku: {v.sku ?? '-'}</span>
                  <span>qty: {v.qty}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div
          className={`absolute left-0 top-full z-20 mt-1 w-[560px] max-w-[90vw] max-h-[40vh] overflow-auto rounded-md border bg-white dark:bg-neutral-900 p-2 shadow-sm ${
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="space-y-1">
            {list.map((v, i) => (
              <div key={i} className="text-[11px] text-gray-600 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(v.attrs).map(([k, val]) => (
                    <span key={k + val} className="px-2 py-0.5 rounded-full border">{k}: {val}</span>
                  ))}
                </div>
                <div className="ml-2 flex items-center gap-3">
                  <span>sku: {v.sku ?? '-'}</span>
                  <span>qty: {v.qty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
