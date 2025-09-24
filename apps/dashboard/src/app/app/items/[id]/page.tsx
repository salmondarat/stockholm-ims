import Link from "next/link";
import { db } from "@stockholm/db";
import CodesActions from "./CodesActions";
import { listVariantQuantities } from "@/lib/options";
import { formatPrice } from "@/lib/price";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Hash,
  Layers,
  MapPin,
  PackageSearch,
  Pencil,
  QrCode,
  Tag,
} from "lucide-react";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await db.item.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!base) return <div className="p-6">Item not found.</div>;
  let variants: Array<{
    attrs: Record<string, string>;
    qty: number;
    sku?: string;
  }> = [];
  try {
    const vrows = await db.itemVariant.findMany({
      where: { itemId: id },
      select: { itemId: true, attrs: true, qty: true, sku: true },
    });
    variants = vrows.map((v) => {
      const attrs = (() => {
        const a = v.attrs as unknown;
        if (a && typeof a === "object" && !Array.isArray(a)) {
          const out: Record<string, string> = {};
          for (const [k, val] of Object.entries(a as Record<string, unknown>))
            out[String(k)] = String(val);
          return out;
        }
        return {} as Record<string, string>;
      })();
      return { attrs, qty: v.qty, sku: v.sku ?? undefined };
    });
  } catch {
    variants = listVariantQuantities(base.options);
  }
  const item = { ...base, variants } as typeof base & {
    variants: typeof variants;
  };

  const media = (await db.itemMedia.findMany({
    where: { itemId: id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true },
  })) as Array<{ id: string; url: string }>;

  const variantsList = item.variants as Array<{
    attrs: Record<string, string>;
    qty: number;
    sku?: string;
  }>;
  const variantsCount = variantsList.length;
  const variantsQuantity = variantsList.reduce(
    (acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0),
    0
  );
  const hasVariants = variantsCount > 0;
  const totalQuantity = hasVariants ? variantsQuantity : item.quantity;
  const threshold = item.lowStockThreshold ?? 0;
  const lowStock = threshold > 0 && totalQuantity <= threshold;
  const priceDisplay = formatPrice(item.price);
  const tags = Array.isArray(item.tags)
    ? (item.tags as string[]).filter(Boolean)
    : [];
  const primaryImage = item.photoUrl ?? media[0]?.url ?? null;
  const gallerySources = media.length
    ? media
    : primaryImage
      ? ([{ id: "primary", url: primaryImage }] as Array<{
          id: string;
          url: string;
        }>)
      : [];
  const secondaryImages = gallerySources.filter(
    (entry) => entry.url !== primaryImage
  );

  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#9333EA] text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
        {primaryImage && (
          <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-60 w-60 -translate-y-1/2 overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-2xl md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt="Item visual"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
        )}
        <div className="relative z-10 p-6 md:p-8">
          <div className="space-y-3">
            <Link
              href="/app/items"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to inventory
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {item.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <Hash className="h-3.5 w-3.5" />{" "}
                  {item.sku ?? "SKU unavailable"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <Tag className="h-3.5 w-3.5" />{" "}
                  {item.category?.name ?? "Uncategorized"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <MapPin className="h-3.5 w-3.5" />{" "}
                  {item.location ?? "No location"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div />
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  lowStock ? "bg-white/20" : "bg-white/15"
                }`}
              >
                {lowStock ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Boxes className="h-3.5 w-3.5" />
                )}
                {lowStock ? "Low stock" : "Stock healthy"}
              </span>
              <Link
                href={`/app/items/${id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25"
              >
                <Pencil className="h-4 w-4" /> Edit item
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <HeroStat
              icon={PackageSearch}
              label="Total stock"
              value={`${totalQuantity} unit${totalQuantity === 1 ? "" : "s"}`}
            />
            <HeroStat
              icon={Layers}
              label="Variants"
              value={hasVariants ? `${variantsCount}` : "Single SKU"}
            />
            <HeroStat icon={Tag} label="Price" value={priceDisplay} />
            <HeroStat
              icon={AlertTriangle}
              label="Threshold"
              value={
                threshold
                  ? `${threshold} unit${threshold === 1 ? "" : "s"}`
                  : "Not set"
              }
              highlight={lowStock}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={Boxes}
              title="Inventory snapshot"
              description="Key properties to help the operations team understand this SKU."
            />
            <div className="grid gap-4 border-t border-gray-100 p-6 text-sm md:grid-cols-2">
              {[
                {
                  icon: Hash,
                  label: "SKU",
                  value: item.sku ?? "Not provided",
                },
                {
                  icon: Tag,
                  label: "Category",
                  value: item.category?.name ?? "Uncategorized",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: item.location ?? "No location set",
                },
                {
                  icon: Boxes,
                  label: "Condition",
                  value: item.condition ?? "Not specified",
                },
                {
                  icon: AlertTriangle,
                  label: "Low-stock threshold",
                  value: threshold
                    ? `${threshold} unit${threshold === 1 ? "" : "s"}`
                    : "Not set",
                  highlight: lowStock,
                },
                {
                  icon: Layers,
                  label: "Quantity source",
                  value: hasVariants
                    ? "Derived from variant counts"
                    : "Single SKU uses direct quantity",
                },
              ].map((detail) => (
                <DetailTile key={detail.label} {...detail} />
              ))}
            </div>
            {tags.length > 0 && (
              <div className="border-t border-gray-100 p-6">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Tags
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={Layers}
              title="Variants & options"
              description="Snapshot of configured options and per-variant availability."
            />
            <div className="border-t border-gray-100 p-6 space-y-4">
              {renderOptions(item.options)}
              {variantsCount > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <div className="grid grid-cols-[1.2fr_1fr_auto] gap-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
                    <div>Attributes</div>
                    <div>SKU</div>
                    <div className="text-right">Qty</div>
                  </div>
                  <div className="divide-y divide-gray-100 text-sm">
                    {variantsList.map((variant, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[1.2fr_1fr_auto] gap-3 px-4 py-3"
                      >
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(variant.attrs).map(([key, val]) => (
                            <span
                              key={`${key}-${val}`}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                        <div className="text-gray-600">
                          {variant.sku ?? "—"}
                        </div>
                        <div className="text-right font-medium">
                          {variant.qty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  This item does not have variant-specific stock.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={QrCode}
              title="Codes & labels"
              description="Generate barcodes, QR codes, and printable labels for this SKU."
            />
            <div className="border-t border-gray-100 p-6">
              <CodesActions id={id} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={Tag}
              title="Pricing"
              description="Visibility into the current price and discount readiness."
            />
            <div className="border-t border-gray-100 p-6">
              <div className="text-3xl font-semibold text-gray-900">
                {priceDisplay}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Price values sync automatically with the items list. Adjust it
                via the edit form to keep exports up to date.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={Boxes}
              title="Media gallery"
              description="Visual reference for pickers and listings."
            />
            <div className="border-t border-gray-100 p-6">
              {gallerySources.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImage || gallerySources[0]!.url}
                    alt="Primary item"
                    className="h-56 w-full rounded-lg object-cover shadow-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {secondaryImages.map((m) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={m.id}
                        src={m.url}
                        alt="Item reference"
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ))}
                    {secondaryImages.length === 0 && (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
                        Add more angles for clarity
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  Upload media in the edit screen to help teammates identify
                  this item faster.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-6 pb-4">
      <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        className={`mt-2 text-sm font-medium ${
          highlight ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white shadow-sm backdrop-blur-md ${
        highlight ? "ring-1 ring-white/70" : ""
      }`}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {label}
        </div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function renderOptions(options: unknown) {
  try {
    const obj: Record<string, unknown> | null =
      options && typeof options === "object"
        ? (options as Record<string, unknown>)
        : null;
    if (!obj)
      return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No custom options configured for this item.
        </div>
      );
    const entries = Object.entries(obj).filter(
      ([k, v]) =>
        !String(k).startsWith("_") &&
        Array.isArray(v) &&
        (v as unknown[]).length
    ) as Array<[string, string[]]>;
    if (!entries.length)
      return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No custom options configured for this item.
        </div>
      );
    return (
      <div className="space-y-4">
        {entries.map(([k, vals]) => (
          <div key={k}>
            <div className="text-xs font-semibold uppercase text-gray-500">
              {k}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {vals.map((v) => (
                <span
                  key={k + v}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        Unable to parse option data.
      </div>
    );
  }
}
export const revalidate = 0; // always render fresh item page
