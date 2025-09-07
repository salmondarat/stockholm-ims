import { auth } from "@/lib/auth";
import { db } from "@stockholm/db";
import Link from "next/link";
import AddItemModal from "@/components/AddItemModal";
import { summarizeOptions } from "@/lib/options";
import { Boxes, Folder, Layers, Wallet } from "lucide-react";

export default async function AppHome() {
  const session = await auth();
  const [_agg, distinctSkus, categoriesCount] = await Promise.all([
    db.item.aggregate({ _sum: { quantity: true } }),
    db.item.findMany({
      where: { sku: { not: null, notIn: [""] } },
      distinct: ["sku"],
      select: { sku: true },
    }),
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
    select: {
      id: true,
      name: true,
      price: true,
      options: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });

  // Modal props
  const categories = await db.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  const s3Enabled = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );

  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <AddItemModal categories={categories} s3Enabled={s3Enabled} />
          <Link
            href="/app/items"
            className="px-3 py-2 rounded-md border bg-white"
          >
            View Items
          </Link>
        </div>
      </div>

      {/* Inventory summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Items",
            value: distinctSkus.length,
            color: "bg-sky-100 text-sky-700",
            Icon: Boxes,
          },
          {
            label: "Categories",
            value: categoriesCount,
            color: "bg-amber-100 text-amber-700",
            Icon: Folder,
          },
          {
            label: "Total Quantity",
            value: totalQty,
            color: "bg-violet-100 text-violet-700",
            Icon: Layers,
          },
          {
            label: "Total Value",
            value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: "bg-orange-100 text-orange-700",
            Icon: Wallet,
          },
        ].map(({ label, value, color, Icon }, i) => (
          <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-full grid place-items-center ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold leading-none">
                  {value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link
            className="text-sm text-sky-600 hover:underline"
            href="/app/items"
          >
            View all activity
          </Link>
        </div>
        <div className="space-y-2">
          {recent.map((r) => {
            const opts = summarizeOptions(r.options);
            const date = new Date(r.createdAt).toLocaleDateString();
            return (
              <div
                key={r.id}
                className="rounded-lg bg-white border shadow-sm px-4 py-3 flex items-center justify-between"
              >
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">You created item </span>
                  <Link
                    href={`/app/items/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.name}
                  </Link>
                  {r.category?.name && (
                    <>
                      <span className="text-gray-500"> in </span>
                      <span className="font-medium">{r.category.name}</span>
                    </>
                  )}
                  {opts && (
                    <span className="text-xs text-gray-500"> — {opts}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{date}</div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

// summary uses shared util
