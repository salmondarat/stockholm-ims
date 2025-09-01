"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AttributeRow = { id: string; name: string; valuesText: string };

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export default function OptionsBuilder({
  defaultValue = "",
  baseSku = "",
  onSummaryChange,
}: {
  defaultValue?: string;
  baseSku?: string;
  onSummaryChange?: (info: { hasVariants: boolean; sumQty: number }) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [rows, setRows] = useState<AttributeRow[]>([]);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const variantsRef = useRef<HTMLInputElement | null>(null);
  type VariantData = { qty: number; sku?: string };
  const [variantMap, setVariantMap] = useState<Record<string, VariantData>>({});

  // Initialize from JSON string if provided
  useEffect(() => {
    if (!defaultValue) return;
    try {
      const obj = JSON.parse(defaultValue) as Record<string, unknown> | null;
      if (obj && typeof obj === "object") {
        const next: AttributeRow[] = [];
        for (const [k, v] of Object.entries(obj)) {
          if (!k || typeof k !== "string") continue;
          if (k.startsWith("_")) continue;
          const arr = Array.isArray(v) ? (v as unknown[]).map(String) : [];
          next.push({ id: uuid(), name: k, valuesText: arr.join(", ") });
        }
        if (next.length) {
          setRows(next);
          setEnabled(true);
        }
        // bootstrap variant quantities
        const variants = Array.isArray((obj as any)._variants)
          ? ((obj as any)._variants as Array<{ attrs?: Record<string, string>; qty?: number; sku?: string }> )
          : [];
        const map: Record<string, VariantData> = {};
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const key = variantKey(v.attrs || {});
          const q = Number(v.qty || 0);
          const sku = typeof v.sku === "string" && v.sku ? v.sku : undefined;
          if (key) map[key] = { qty: q, sku };
        }
        setVariantMap(map);
      }
    } catch {
      /* ignore */
    }
  }, [defaultValue]);

  const json = useMemo(() => {
    if (!enabled) return "";
    const obj: Record<string, string[]> = {};
    for (const r of rows) {
      const key = r.name.trim();
      if (!key) continue;
      const parts = r.valuesText
        .split(/[,\n]/g)
        .map((s) => s.trim())
        .filter(Boolean);
      const uniq = Array.from(new Set(parts));
      if (uniq.length) obj[key] = uniq;
    }
    return Object.keys(obj).length ? JSON.stringify(obj) : "";
  }, [enabled, rows]);

  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = json;
  }, [json]);

  // Compute combinations
  const attributes = useMemo(() => {
    const list = rows
      .map((r) => ({ key: r.name.trim(), values: r.valuesText.split(/[,\n]/g).map((s) => s.trim()).filter(Boolean) }))
      .filter((r) => r.key && r.values.length);
    return list;
  }, [rows]);

  const combos = useMemo(() => {
    const res: Array<Record<string, string>> = [];
    if (!enabled || !attributes.length) return res;
    const cap = 50; // safety cap
    const dfs = (i: number, acc: Record<string, string>) => {
      if (res.length >= cap) return;
      if (i >= attributes.length) {
        res.push({ ...acc });
        return;
      }
      const { key, values } = attributes[i];
      for (const v of values) {
        acc[key] = v;
        dfs(i + 1, acc);
      }
    };
    dfs(0, {});
    return res;
  }, [attributes, enabled]);

  const skuCounts = useMemo(() => {
    const map = new Map<string, number>();
    combos.forEach((attrs, idx) => {
      const key = variantKey(attrs);
      const ent = variantMap[key] || { qty: 0, sku: baseSku ? `${baseSku}-${idx + 1}` : "" };
      const sku = (ent.sku || "").trim();
      if (!sku) return;
      map.set(sku, (map.get(sku) || 0) + 1);
    });
    return map;
  }, [combos, variantMap, baseSku]);

  useEffect(() => {
    if (!variantsRef.current) return;
    // build array from map in combos order for stable default SKU assignment
    const arr = combos.map((attrs, idx) => {
      const key = variantKey(attrs);
      const ent = variantMap[key] || { qty: 0, sku: undefined };
      let sku = ent.sku;
      if (!sku && baseSku) sku = `${baseSku}-${idx + 1}`;
      return { attrs, qty: ent.qty ?? 0, sku };
    });
    variantsRef.current.value = combos.length ? JSON.stringify(arr) : "";
    const sum = arr.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? Number(v.qty) : 0), 0);
    onSummaryChange?.({ hasVariants: combos.length > 0, sumQty: sum });
  }, [variantMap, combos, baseSku]);

  const setQty = (attrs: Record<string, string>, qty: number) => {
    const key = variantKey(attrs);
    setVariantMap((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), qty } }));
  };
  const setSku = (attrs: Record<string, string>, sku: string) => {
    const key = variantKey(attrs);
    setVariantMap((prev) => ({ ...prev, [key]: { ...(prev[key] || { qty: 0 }), sku } }));
  };

  function variantKey(attrs: Record<string, string>): string {
    return Object.entries(attrs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("|");
  }
  function parseVariantKey(key: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of key.split("|")) {
      const [k, v] = part.split("=");
      if (k && v) out[k] = v;
    }
    return out;
  }

  const addRow = () => setRows((r) => [...r, { id: uuid(), name: "", valuesText: "" }]);
  const removeRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  return (
    <div className="space-y-2">
      <input ref={hiddenRef} type="hidden" name="options" defaultValue="" />
      <input type="hidden" name="optionsEnabled" value={enabled ? "1" : "0"} />

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">This item has variants</label>
        <button
          type="button"
          aria-pressed={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
            enabled ? "bg-emerald-500 border-emerald-500" : "bg-gray-200 border-gray-300"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transform transition-transform ml-0.5 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-2 space-y-3">
          <div className="text-xs font-semibold tracking-wide text-gray-600">
            ATTRIBUTES AND OPTIONS
          </div>

          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
              <input
                className="border rounded px-3 py-2"
                placeholder="Attribute (e.g. Size or Color)*"
                value={row.name}
                onChange={(e) =>
                  setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r)))
                }
              />
              <div>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Options*"
                  value={row.valuesText}
                  onChange={(e) =>
                    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, valuesText: e.target.value } : r)))
                  }
                />
                <div className="mt-1 text-[11px] text-gray-500">Separate with commas, e.g. Red, Blue</div>
              </div>
              <button
                type="button"
                className="h-10 w-10 inline-flex items-center justify-center rounded border text-gray-600 hover:bg-gray-50"
                onClick={() => removeRow(row.id)}
                aria-label="Remove attribute"
                title="Remove attribute"
              >
                🗑
              </button>
            </div>
          ))}

          <button type="button" onClick={addRow} className="text-sm inline-flex items-center gap-2 text-gray-700">
            <span className="text-lg leading-none">＋</span> ADD ATTRIBUTE
          </button>

          {!!combos.length && (
            <div className="mt-4">
              <div className="text-xs font-semibold tracking-wide text-gray-600 mb-2">
                VARIANT QUANTITIES (optional)
              </div>
              <input ref={variantsRef} type="hidden" name="variants" defaultValue="" />
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {combos.map((attrs, idx) => {
                  const key = variantKey(attrs);
                  const data = variantMap[key] || { qty: 0, sku: baseSku ? `${baseSku}-${idx + 1}` : "" };
                  const qty = data.qty ?? 0;
                  const sku = data.sku ?? (baseSku ? `${baseSku}-${idx + 1}` : "");
                  const dupe = (sku.trim() && (skuCounts.get(sku.trim()) || 0) > 1);
                  return (
                    <div key={key || idx} className="flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-700 flex flex-wrap gap-1">
                        {Object.entries(attrs).map(([k, v]) => (
                          <span key={k + v} className="px-2 py-0.5 rounded-full border">{k}: {v}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className={`w-40 border rounded px-2 py-1 text-sm ${dupe ? 'border-red-500 bg-red-50' : ''}`}
                          value={sku}
                          onChange={(e) => setSku(attrs, e.target.value)}
                          placeholder={baseSku ? `${baseSku}-${idx + 1}` : "SKU"}
                        />
                        <input
                          type="number"
                          min={0}
                          className="w-20 border rounded px-2 py-1 text-sm"
                          value={qty}
                          onChange={(e) => setQty(attrs, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        />
                        <span className="text-xs text-gray-500">qty</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {Array.from(skuCounts.entries()).some(([_, n]) => n > 1) && (
                <div className="text-xs text-red-600 mt-2">Duplicate variant SKUs detected. Please ensure each SKU is unique.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
