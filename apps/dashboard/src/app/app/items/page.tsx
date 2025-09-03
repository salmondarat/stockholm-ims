import { db } from "@stockholm/db";
import { updateQuantity, deleteItem } from "./actions";
import Link from "next/link";
// import { summarizeOptions } from "@/lib/options";
import VariantDetailsToggle from "@/components/VariantDetailsToggle";
import { listVariantQuantities } from "@/lib/options";

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
  const skuQuery = typeof params?.sku === "string" ? params.sku : undefined;

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
    category: { name: string } | null;
    options: unknown;
    variants: Array<{ attrs: Record<string, string>; qty: number; sku?: string }>;
  }> = [];
  const rows = await db.item.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: { select: { name: true } } },
  });
  const ids = rows.map((r) => r.id);
  const dbAny = db as unknown as {
    itemVariant?: {
      findMany: (args: unknown) => Promise<Array<{ itemId: string; attrs: Record<string, string>; qty: number; sku: string | null }>>;
    };
  };
  const variantsMap = new Map<string, Array<{ attrs: Record<string, string>; qty: number; sku?: string }>>();
  if (dbAny.itemVariant && typeof dbAny.itemVariant.findMany === "function" && ids.length) {
    try {
      const vrows = await dbAny.itemVariant.findMany({
        where: { itemId: { in: ids } },
        select: { itemId: true, attrs: true, qty: true, sku: true },
      } as unknown);
      for (const v of vrows) {
        const arr = variantsMap.get(v.itemId) ?? [];
        arr.push({ attrs: v.attrs, qty: v.qty, sku: v.sku ?? undefined });
        variantsMap.set(v.itemId, arr);
      }
    } catch {
      // ignore; will fallback to legacy
    }
  }
  list = rows.map((r) => {
    const legacy = listVariantQuantities((r as unknown as { options: unknown }).options);
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
      lowStockThreshold: (r as unknown as { lowStockThreshold: number | null }).lowStockThreshold ?? 0,
      category: r.category as { name: string } | null,
      options: (r as unknown as { options: unknown }).options,
      variants: vars,
    };
  });

  const isLow = (it: (typeof list)[number]) =>
    (it.lowStockThreshold ?? 0) > 0 &&
    it.quantity <= (it.lowStockThreshold ?? 0);

  const lowCount = list.filter(isLow).length;
  let data = filter === "low" ? list.filter(isLow) : list;
  if (skuQuery) {
    const q = skuQuery.toLowerCase();
    data = data.filter((it) => (it.sku ?? "").toLowerCase().includes(q));
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Items</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/api/exports/items"
            className="px-3 py-2 rounded-md bg-emerald-600 text-white"
            prefetch={false}
          >
            Export PDF
          </Link>
          <Link
            href="/app/items/new"
            className="px-3 py-2 rounded-md bg-black text-white"
          >
            Add Item
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/app/items"
          className={`px-2 py-1 rounded border ${filter !== "low" ? "bg-gray-100" : "bg-white"}`}
        >
          All
        </Link>
        <Link
          href="/app/items?filter=low"
          className={`px-2 py-1 rounded border ${filter === "low" ? "bg-red-50 border-red-300 text-red-700" : "bg-white"}`}
        >
          Low Stock
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-white text-xs">
            {lowCount}
          </span>
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden">
        <div className="divide-y rounded-md border bg-white">
          {data.map((it) => {
            const low = isLow(it);
            const sum = it.variants.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0), 0);
            const hasVariants = it.variants.length > 0;
            return (
              <div key={it.id} className="p-3">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    {it.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.photoUrl} alt="" className="h-16 w-16 object-cover rounded-md border" />
                    ) : (
                      <div className="h-16 w-16 grid place-items-center text-xs text-gray-400 border rounded-md">—</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/app/items/${it.id}`} className="font-medium truncate">{it.name}</Link>
                      {low ? (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-red-100 text-red-700">Low</span>
                      ) : (
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-green-100 text-green-700">OK</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">SKU: {it.sku ?? '-'}</div>
                    <div className="mt-1 text-sm flex items-center gap-4">
                      <div className="font-medium">{hasVariants ? sum : it.quantity}</div>
                      {hasVariants && <div className="text-[11px] text-gray-500">from variants</div>}
                      {typeof it.price === "object" || typeof it.price === "number" ? (
                        <div className="ml-auto text-right text-sm">{"$" + Number(it.price || 0).toFixed(2)}</div>
                      ) : (
                        <div className="ml-auto text-right text-sm">{"$0.00"}</div>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">{it.category?.name ?? '-'} • {it.location ?? '-'}</div>
                    <div className="mt-1">
                      <VariantDetailsToggle inline variants={it.variants as Array<{ attrs: Record<string, string>; qty: number; sku?: string }>} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Link href={`/app/items/${it.id}/edit`} className="px-2 py-1 border rounded">Edit</Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteItem(it.id);
                        }}
                      >
                        <button className="px-2 py-1 border rounded">Delete</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!data.length && (
            <div className="p-6 text-center text-gray-500">{filter === "low" ? "No low-stock items." : "No items yet."}</div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet: table with horizontal scroll if needed */}
      {/* Fix layout shift when toggling variant details by reserving space */}
      <div className="hidden md:block overflow-x-auto min-h-[480px]">
        <table className="w-full text-sm border-collapse min-w-[920px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Photo</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Price</th>
              <th className="text-left p-2">Location</th>
              <th className="text-left p-2">Condition</th>
              <th className="text-left p-2">Tags</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => {
              const low = isLow(it);
              return (
                <tr key={it.id} className="border-b">
                  <td className="p-2">
                    {it.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.photoUrl}
                        alt=""
                        className="h-12 w-12 object-cover rounded-md border"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-2 align-top relative">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={`/app/items/${it.id}`}>{it.name}</Link>
                    </div>
                    <div className="text-[11px] text-gray-500">SKU: {it.sku ?? '-'}</div>
                    {/* Move Show variants toggle to the bottom of the main SKU block */}
                    <div className="mt-1">
                      <VariantDetailsToggle inline variants={it.variants as Array<{ attrs: Record<string, string>; qty: number; sku?: string }>} />
                    </div>
                  </td>
                  <td className="p-2">{it.category?.name ?? "-"}</td>
                  <td className="p-2 text-right align-top">
                    {(() => {
                      const sum = it.variants.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0), 0);
                      const hasVariants = it.variants.length > 0;
                      if (hasVariants) {
                        return (
                          <div className="text-right">
                            <div className="font-medium">{sum}</div>
                            <div className="text-[11px] text-gray-500">from variants</div>
                          </div>
                        );
                      }
                      return (
                        <form
                          action={async (fd) => {
                            "use server";
                            const q = Number(fd.get("q") ?? it.quantity);
                            await updateQuantity(it.id, q);
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          <input
                            type="number"
                            name="q"
                            defaultValue={it.quantity}
                            min={0}
                            className="w-20 border rounded px-2 py-1"
                          />
                          <button className="text-xs px-2 py-1 border rounded">
                            Save
                          </button>
                        </form>
                      );
                    })()}
                  </td>
                  <td className="p-2 text-right">{typeof it.price === "object" || typeof it.price === "number" ? `$${Number(it.price || 0).toFixed(2)}` : "$0.00"}</td>
                  <td className="p-2">{it.location ?? "-"}</td>
                  <td className="p-2">{it.condition ?? "-"}</td>
                  <td className="p-2">
                    {Array.isArray(it.tags) ? it.tags.join(", ") : "-"}
                  </td>
                  <td className="p-2">
                    {low ? (
                      <span className="text-xs rounded px-2 py-1 bg-red-100 text-red-700">
                        Low
                      </span>
                    ) : (
                      <span className="text-xs rounded px-2 py-1 bg-green-100 text-green-700">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <form
                      action={async () => {
                        "use server";
                        await deleteItem(it.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/items/${it.id}/edit`}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          Edit
                        </Link>
                        <button className="text-xs px-2 py-1 border rounded">
                          Delete
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!data.length && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={10}>
                  {filter === "low" ? "No low-stock items." : "No items yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
export const revalidate = 0; // always render fresh list
