import { db } from "@stockholm/db";
import { updateQuantity, deleteItem } from "./actions";
import Link from "next/link";

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

  const list = await db.item.findMany({ orderBy: { createdAt: "asc" } });

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
      <div className="flex items-center justify-between">
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

      <div className="flex items-center gap-2 text-sm">
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Photo</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-right p-2">Qty</th>
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
                  <td className="p-2">
                    <Link href={`/app/items/${it.id}`}>{it.name}</Link>
                  </td>
                  <td className="p-2">{it.sku ?? "-"}</td>
                  <td className="p-2 text-right">
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
                  </td>
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
                <td className="p-6 text-center text-gray-500" colSpan={9}>
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
