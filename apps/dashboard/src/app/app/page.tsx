import { auth } from "@/lib/auth";
import { db } from "@stockholm/db";
import Link from "next/link";

export default async function AppHome() {
  const session = await auth();
  const [_agg, distinctSkus] = await Promise.all([
    db.item.aggregate({ _sum: { quantity: true } }),
    db.item.findMany({ where: { sku: { not: null, notIn: [""] } }, distinct: ["sku"], select: { sku: true } }),
  ]);
  const totalQty = _agg._sum.quantity ?? 0;
  const totalValueRow = await db.$queryRaw<{ total: any }[]>`
    SELECT COALESCE(SUM("quantity" * COALESCE("price", 0)), 0) AS total FROM "items"
  `;
  const totalValue = Number(totalValueRow?.[0]?.total ?? 0);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-gray-600">Signed in as {session?.user?.email ?? "guest"}</div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </section>

      <section>
        <Link className="underline" href="/app/items">
          Go to Items
        </Link>
      </section>
    </main>
  );
}
