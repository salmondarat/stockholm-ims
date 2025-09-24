export function resolvePrice(price: unknown): number {
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price === "string") {
    const parsed = Number.parseFloat(price);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof price === "bigint") {
    const numeric = Number(price);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  if (typeof price === "object" && price !== null) {
    try {
      const valueOf = (price as { valueOf?: () => unknown }).valueOf;
      if (typeof valueOf === "function") {
        const val = Number(valueOf.call(price));
        if (Number.isFinite(val)) return val;
      }
    } catch {
      // ignore and try fallback below
    }
    try {
      const parsed = Number.parseFloat(String(price));
      if (Number.isFinite(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return 0;
}

export function formatPrice(
  price: unknown,
  options: Intl.NumberFormatOptions = { style: "currency", currency: "USD" },
): string {
  const value = resolvePrice(price);
  try {
    return new Intl.NumberFormat("en-US", options).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}
