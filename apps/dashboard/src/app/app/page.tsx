import { auth } from "@/lib/auth";
import { db } from "@stockholm/db";
import Link from "next/link";
import AddItemModal from "@/components/AddItemModal";
import { summarizeOptions } from "@/lib/options";
import {
  ArrowUpRight,
  Boxes,
  Folder,
  Layers,
  Wallet,
} from "lucide-react";

export default async function AppHome() {
  await auth();

  const [
    quantityAgg,
    distinctSkus,
    categoriesCount,
    totalValueRow,
    recent,
    categories,
    lowStockRow,
  ] = await Promise.all([
    db.item.aggregate({ _sum: { quantity: true } }),
    db.item.findMany({
      where: { sku: { not: null, notIn: [""] } },
      distinct: ["sku"],
      select: { sku: true },
    }),
    db.category.count(),
    db.$queryRaw<{ total: unknown }[]>`
      SELECT COALESCE(SUM("quantity" * COALESCE("price", 0)), 0) AS total FROM "items"
    `,
    db.item.findMany({
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
    }),
    db.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
    }),
    db.$queryRaw<{ count: unknown }[]>`
      SELECT COUNT(*) AS count
      FROM "items"
      WHERE "low_stock_threshold" > 0
        AND "quantity" <= "low_stock_threshold"
    `,
  ]);

  const totalQty = quantityAgg._sum.quantity ?? 0;
  const totalValue = Number(totalValueRow?.[0]?.total ?? 0);
  const lowStockCount = Number(lowStockRow?.[0]?.count ?? 0);
  const s3Enabled = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const metrics = [
    {
      label: "Unique SKUs",
      value: distinctSkus.length.toLocaleString(),
      helper: "Active products in catalog",
      Icon: Boxes,
    },
    {
      label: "Categories",
      value: categoriesCount.toLocaleString(),
      helper: "Ways you're organizing inventory",
      Icon: Folder,
    },
    {
      label: "Total Quantity",
      value: totalQty.toLocaleString(),
      helper: "Units on hand across locations",
      Icon: Layers,
    },
    {
      label: "Inventory Value",
      value: currencyFormatter.format(totalValue),
      helper: "Based on quantity × price",
      Icon: Wallet,
    },
  ];

  const noRecentActivity = recent.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Inventory dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor stock levels, categories, and recent changes in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/app/items"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            View items
          </Link>
          <AddItemModal
            categories={categories}
            s3Enabled={s3Enabled}
            buttonClass="inline-flex h-10 items-center justify-center rounded-lg bg-[#280299] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f0277]"
          />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, helper, Icon }) => (
          <div
            key={label}
            className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{helper}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#280299]/10 text-[#280299]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest updates performed in your inventory.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-[#280299] transition hover:text-[#1f0277]"
              href="/app/items"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3 px-6 py-5">
            {noRecentActivity ? (
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No activity yet. Add an item to see updates here.
              </div>
            ) : (
              recent.map((r) => {
                const opts = summarizeOptions(r.options);
                const date = new Date(r.createdAt).toLocaleDateString();
                return (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background px-4 py-3 shadow-sm"
                  >
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-muted-foreground">
                        You created
                      </span>{" "}
                      <Link
                        href={`/app/items/${r.id}`}
                        className="font-medium text-foreground transition hover:text-[#280299] hover:underline"
                      >
                        {r.name}
                      </Link>
                      {r.category?.name && (
                        <>
                          <span className="text-muted-foreground"> in </span>
                          <span className="font-medium text-foreground">
                            {r.category.name}
                          </span>
                        </>
                      )}
                      {opts && (
                        <div className="text-xs text-muted-foreground/80">
                          {opts}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {date}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="flex h-full flex-col justify-between gap-6 rounded-xl border bg-[#280299] p-6 text-white shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Inventory health</h2>
            <p className="text-sm text-white/80">
              Set restock priorities and keep shelves full.
            </p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Low stock alerts</dt>
              <dd className="text-base font-semibold">{lowStockCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Unique SKUs</dt>
              <dd className="text-base font-semibold">
                {distinctSkus.length.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Categories tracked</dt>
              <dd className="text-base font-semibold">
                {categoriesCount.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-white/70">Inventory value</dt>
              <dd className="text-base font-semibold">
                {currencyFormatter.format(totalValue)}
              </dd>
            </div>
          </dl>
          <div className="grid gap-2 text-sm">
            <Link
              href="/app/items?filter=low"
              className="inline-flex items-center justify-between rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
            >
              Review low stock
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/tags"
              className="inline-flex items-center justify-between rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
            >
              Manage tags
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
