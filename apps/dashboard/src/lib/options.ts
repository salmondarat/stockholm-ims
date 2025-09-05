export function summarizeOptions(options: unknown, maxLen = 80): string {
  try {
    const obj = options && typeof options === "object" ? (options as Record<string, unknown>) : null;
    if (!obj) return "";
    const entries = Object.entries(obj).filter(
      ([k, v]) => !String(k).startsWith("_") && Array.isArray(v) && (v as unknown[]).length
    ) as Array<[string, string[]]>;
    if (!entries.length) return "";
    const parts = entries.map(([k, vals]) => `${k}: ${vals.join("/")}`);
    const text = parts.join(" • ");
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
  } catch {
    return "";
  }
}

export function getVariantQuantitySum(options: unknown): number {
  try {
    const variants = listVariantQuantities(options);
    return variants.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? Number(v.qty) : 0), 0);
  } catch {
    return 0;
  }
}

export function listVariantQuantities(options: unknown): Array<{ attrs: Record<string, string>; qty: number; sku?: string }>
{
  try {
    const obj = options && typeof options === "object" ? (options as Record<string, unknown>) : null;
    if (!obj) return [];
    const raw = obj as { _variants?: unknown; __variants?: unknown };
    const arr = ((raw._variants as unknown) || (raw.__variants as unknown) || []) as Array<{
      attrs?: Record<string, string>;
      qty?: number;
      sku?: string;
    }>;
    if (!Array.isArray(arr)) return [];
    const safe: Array<{ attrs: Record<string, string>; qty: number; sku?: string }> = [];
    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const attrs = it.attrs && typeof it.attrs === "object" ? it.attrs : {};
      const qty = Number.isFinite(it.qty) ? Number(it.qty) : 0;
      const sku = typeof it.sku === "string" ? it.sku : undefined;
      safe.push({ attrs: Object.fromEntries(Object.entries(attrs).map(([k, v]) => [String(k), String(v)])), qty, sku });
    }
    return safe;
  } catch {
    return [];
  }
}
