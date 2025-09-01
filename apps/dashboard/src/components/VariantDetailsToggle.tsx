"use client";

import { useState } from "react";
import { listVariantQuantities } from "@/lib/options";

export default function VariantDetailsToggle({ options, inline = false }: { options: any; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const list = listVariantQuantities(options);
  if (!list.length) return null;
  return (
    <div className={inline ? "inline-block ml-2" : "mt-1"}>
      <button
        type="button"
        className={inline ? "text-[11px] underline text-gray-600 align-baseline" : "text-[11px] underline text-gray-600"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide variants" : "Show variants"}
      </button>
      {open && (
        <div className="mt-1 space-y-1">
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
      )}
    </div>
  );
}
