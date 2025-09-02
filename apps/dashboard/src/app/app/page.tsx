import { auth } from "@/lib/auth";
import { db } from "@stockholm/db";
import Link from "next/link";
import { summarizeOptions } from "@/lib/options";

export default async function AppHome() {
  const session = await auth();
  const [_agg, distinctSkus, categoriesCount] = await Promise.all([
    db.item.aggregate({ _sum: { quantity: true } }),
    db.item.findMany({ where: { sku: { not: null, notIn: [""] } }, distinct: ["sku"], select: { sku: true } }),
    db.category.count(),
  ]);
  const totalQty = _agg._sum.quantity ?? 0;
  const totalValueRow = await db.$queryRaw<{ total: unknown }[]>`
    SELECT COALESCE(SUM("quantity" * COALESCE("price", 0)), 0) AS total FROM "items"
  `;
  const totalValue = Number(totalValueRow?.[0]?.total ?? 0);
  const recent = await db.item.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, price: true, options: true, category: { select: { name: true } } },
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-gray-600">Signed in as {session?.user?.email ?? "guest"}</div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-500">Unique SKUs</div>
          <div className="text-2xl font-semibold">{distinctSkus.length}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-500">Total Quantity</div>
          <div className="text-2xl font-semibold">{totalQty}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-semibold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-sm text-gray-500">Categories</div>
          <div className="text-2xl font-semibold">{categoriesCount}</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Items</h2>
          <Link className="underline text-sm" href="/app/items">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-right p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const opts = summarizeOptions(r.options);
                return (
                  <tr key={r.id} className="border-b align-top">
                    <td className="p-2">
                      <Link href={`/app/items/${r.id}`}>{r.name}</Link>
                      {opts && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{opts}</div>
                      )}
                    </td>
                    <td className="p-2">{r.category?.name ?? "-"}</td>
                    <td className="p-2 text-right">${Number(r.price ?? 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

// summary uses shared util
