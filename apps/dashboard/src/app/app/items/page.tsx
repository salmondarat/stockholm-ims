import { db } from "@stockholm/db";
import { updateQuantity, deleteItem } from "./actions";
import Link from "next/link";
import AddItemModal from "@/components/AddItemModal";
import FilterMenu from "@/components/FilterMenu";
import { Pencil } from "lucide-react";
import VariantDetailsToggle from "@/components/VariantDetailsToggle";
import { listVariantQuantities } from "@/lib/options";
import { resolvePrice } from "@/lib/price";
import DeleteItemButton from "./DeleteItemButton";

export const metadata = { title: "Items — Stockholm IMS" };

export default async function ItemsPage({
  searchParams,
}: {
  // 👇 React 19: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 👇 MUST await before using properties
  const params = await searchParams;
  const filter = typeof params?.filter === "string" ? params.filter : undefined;
  const searchQuery =
    typeof params?.search === "string" ? params.search?.trim() : undefined;
  const categoryFilter =
    typeof params?.category === "string" ? params.category : undefined;
  const conditionFilter =
    typeof params?.condition === "string" ? params.condition : undefined;
  const locationFilter =
    typeof params?.location === "string" ? params.location : undefined;

  // Load items; if ItemVariant model exists, load variants via separate query; otherwise derive from legacy options
  let list: Array<{
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    location: string | null;
    condition: string | null;
    photoUrl: string | null;
    tags: unknown;
    price: unknown;
    lowStockThreshold: number | null;
    category: { id: string; name: string } | null;
    options: unknown;
    variants: Array<{
      attrs: Record<string, string>;
      qty: number;
      sku?: string;
    }>;
  }> = [];
  const rows = await db.item.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: { select: { id: true, name: true } } },
  });
  const ids = rows.map((r) => r.id);
  const variantsMap = new Map<
    string,
    Array<{ attrs: Record<string, string>; qty: number; sku?: string }>
  >();
  if (ids.length) {
    try {
      const vrows = await db.itemVariant.findMany({
        where: { itemId: { in: ids } },
        select: { itemId: true, attrs: true, qty: true, sku: true },
      });
      for (const v of vrows) {
        const arr = variantsMap.get(v.itemId) ?? [];
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
        arr.push({ attrs, qty: v.qty, sku: v.sku ?? undefined });
        variantsMap.set(v.itemId, arr);
      }
    } catch {
      // ignore; will fallback to legacy
    }
  }
  list = rows.map((r) => {
    const legacy = listVariantQuantities((r as { options?: unknown }).options);
    const vars = variantsMap.get(r.id) ?? legacy;
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      quantity: r.quantity,
      location: r.location,
      condition: r.condition,
      photoUrl: r.photoUrl,
      tags: r.tags,
      price: r.price,
      lowStockThreshold:
        (r as { lowStockThreshold?: number | null }).lowStockThreshold ?? 0,
      category: r.category
        ? { id: r.category.id, name: r.category.name }
        : null,
      options: (r as { options?: unknown }).options,
      variants: vars,
    };
  });

  const isLow = (it: (typeof list)[number]) =>
    (it.lowStockThreshold ?? 0) > 0 &&
    it.quantity <= (it.lowStockThreshold ?? 0);

  const lowCount = list.filter(isLow).length;
  let data = filter === "low" ? list.filter(isLow) : list;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter((it) => {
      const nameMatch = it.name.toLowerCase().includes(q);
      const skuMatch = (it.sku ?? "").toLowerCase().includes(q);
      let tagsMatch = false;
      if (it.tags) {
        if (Array.isArray(it.tags)) {
          tagsMatch = it.tags.some((tag: string) =>
            tag.toLowerCase().includes(q)
          );
        } else {
          tagsMatch = JSON.stringify(it.tags).toLowerCase().includes(q);
        }
      }
      return nameMatch || skuMatch || tagsMatch;
    });
  }

  if (categoryFilter) {
    data = data.filter((it) => it.category?.id === categoryFilter);
  }

  if (conditionFilter) {
    data = data.filter((it) => it.condition === conditionFilter);
  }

  if (locationFilter) {
    data = data.filter((it) => it.location === locationFilter);
  }

  // Categories for AddItemModal and filters
  const categories = await db.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  // Unique conditions and locations for filters
  const uniqueConditions = await db.item.findMany({
    select: { condition: true },
    distinct: ["condition"],
    where: { condition: { not: null } },
    orderBy: { condition: "asc" },
  });

  const uniqueLocations = await db.item.findMany({
    select: { location: true },
    distinct: ["location"],
    where: { location: { not: null } },
    orderBy: { location: "asc" },
  });
  const s3Enabled = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );

  const allParams = new URLSearchParams();
  if (searchQuery) allParams.set("search", searchQuery);
  if (categoryFilter) allParams.set("category", categoryFilter);
  if (conditionFilter) allParams.set("condition", conditionFilter);
  if (locationFilter) allParams.set("location", locationFilter);
  const allHref = allParams.toString()
    ? `/app/items?${allParams.toString()}`
    : "/app/items";

  const lowParams = new URLSearchParams({ filter: "low" });
  if (searchQuery) lowParams.set("search", searchQuery);
  if (categoryFilter) lowParams.set("category", categoryFilter);
  if (conditionFilter) lowParams.set("condition", conditionFilter);
  if (locationFilter) lowParams.set("location", locationFilter);
  const lowHref = `/app/items?${lowParams.toString()}`;

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Items</h1>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/api/exports/items"
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            prefetch={false}
          >
            Export PDF
          </Link>
          <AddItemModal
            categories={categories}
            s3Enabled={s3Enabled}
            buttonClass="px-4 py-2 text-sm font-medium text-white bg-[#4F46E5] rounded-md shadow-sm hover:bg-indigo-600 transition-colors"
          />
        </div>
      </div>

      <FilterMenu
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        conditionFilter={conditionFilter}
        locationFilter={locationFilter}
        filter={filter}
        categories={categories}
        uniqueConditions={uniqueConditions
          .map((c) => c.condition)
          .filter((val): val is string => val != null)}
        uniqueLocations={uniqueLocations
          .map((l) => l.location)
          .filter((val): val is string => val != null)}
      />

      <div className="flex items-center space-x-6 border-b border-gray-200 pb-2">
        <Link
          href={allHref}
          className={`py-3 font-medium border-b-2 transition-colors ${
            filter !== "low"
              ? "border-[#4F46E5] text-[#4F46E5]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All
        </Link>
        <Link
          href={lowHref}
          className={`relative py-3 font-medium border-b-2 transition-colors ${
            filter === "low"
              ? "border-[#4F46E5] text-[#4F46E5]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Low Stock
          <span className="absolute top-1 -right-5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {lowCount}
          </span>
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-4">
        {data.map((it) => {
          const low = isLow(it);
          const sum = it.variants.reduce(
            (acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0),
            0
          );
          const hasVariants = it.variants.length > 0;
          const priceValue = resolvePrice(it.price);
          const priceDisplay = Number.isFinite(priceValue)
            ? `$${priceValue.toFixed(2)}`
            : "$0.00";
          return (
            <div
              key={it.id}
              className={`rounded-xl border border-gray-200 bg-white shadow-sm p-4 ${low ? "bg-red-50 border-red-300" : ""}`}
            >
              <div className="grid grid-cols-[64px_1fr] gap-3">
                <div className="shrink-0">
                  {it.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.photoUrl}
                      alt=""
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 grid place-items-center rounded-md bg-gray-100 text-xs text-gray-400">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/app/items/${it.id}`}
                      className="font-semibold truncate"
                    >
                      {it.name}
                    </Link>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    SKU: {it.sku ?? "-"}
                  </div>
                  <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
                    <div className="font-medium">
                      {hasVariants ? sum : it.quantity}
                    </div>
                    {hasVariants ? (
                      <div className="text-[11px] text-gray-500">
                        from variants
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500">Qty</div>
                    )}
                    <div className="text-right font-medium text-gray-900">
                      {priceDisplay}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {it.category?.name ?? "-"} • {it.location ?? "-"}
                  </div>
                  <div className="mt-2">
                    <VariantDetailsToggle
                      inline
                      variants={
                        it.variants as Array<{
                          attrs: Record<string, string>;
                          qty: number;
                          sku?: string;
                        }>
                      }
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/app/items/${it.id}/edit`}
                      aria-label="Edit item"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#4F46E5] text-white shadow-sm hover:bg-[#4338CA] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteItemButton
                      itemName={it.name}
                      onDelete={async () => {
                        "use server";
                        await deleteItem(it.id);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!data.length && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            {filter === "low" ? "No low-stock items." : "No items yet."}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-500">
            <div className="col-span-1" />
            <div className="col-span-4">Name / SKU</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-right">Qty</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {data.map((it, index) => {
            const low = isLow(it);
            const sum = it.variants.reduce(
              (acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0),
              0
            );
            const hasVariants = it.variants.length > 0;
            const priceValue = resolvePrice(it.price);
            const priceDisplay = Number.isFinite(priceValue)
              ? `$${priceValue.toFixed(2)}`
              : "$0.00";
            return (
              <div
                key={it.id}
                className={`grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm transition-colors ${
                  index !== 0 ? "border-t border-gray-100" : ""
                } ${low ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-indigo-50/40"}`}
              >
                <div className="col-span-1">
                  {it.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.photoUrl}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-gray-100 grid place-items-center text-xs text-gray-400">
                      —
                    </div>
                  )}
                </div>
                <div className="col-span-4">
                  <Link
                    href={`/app/items/${it.id}`}
                    className="font-medium text-gray-900 hover:text-[#4F46E5]"
                  >
                    {it.name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>SKU: {it.sku ?? "-"}</span>
                    <span className="text-gray-300">•</span>
                    <span>{it.location ?? "No location"}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <VariantDetailsToggle
                      inline
                      variants={
                        it.variants as Array<{
                          attrs: Record<string, string>;
                          qty: number;
                          sku?: string;
                        }>
                      }
                    />
                  </div>
                </div>
                <div className="col-span-2 text-gray-700">
                  {it.category?.name ?? "-"}
                </div>
                <div className="col-span-1 text-right font-medium text-gray-900">
                  {hasVariants ? (
                    <div>
                      <div>{sum}</div>
                      <div className="text-[11px] text-gray-500">
                        from variants
                      </div>
                    </div>
                  ) : (
                    <form
                      action={async (fd) => {
                        "use server";
                        const q = Number(fd.get("q") ?? it.quantity);
                        await updateQuantity(it.id, q);
                      }}
                      className="inline-flex items-center justify-end gap-2"
                    >
                      <input
                        type="number"
                        name="q"
                        defaultValue={it.quantity}
                        min={0}
                        className="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm"
                      />
                      <button className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:border-gray-400">
                        Save
                      </button>
                    </form>
                  )}
                </div>
                <div className="col-span-1 text-right font-semibold text-gray-900">
                  {priceDisplay}
                </div>
                <div className="col-span-1 flex justify-center" />
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/app/items/${it.id}/edit`}
                    aria-label="Edit item"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#4F46E5] text-white shadow-sm hover:bg-[#4338CA] transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteItemButton
                    itemName={it.name}
                    onDelete={async () => {
                      "use server";
                      await deleteItem(it.id);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                  />
                </div>
              </div>
            );
          })}
          {!data.length && (
            <div className="px-6 py-12 text-center text-gray-500">
              {filter === "low" ? "No low-stock items." : "No items yet."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export const revalidate = 0; // always render fresh list
