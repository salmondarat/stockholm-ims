import { db } from "@stockholm/db";
import Link from "next/link";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page || 1));
  const pageSize = Math.min(
    100,
    Math.max(10, Number(searchParams?.pageSize || 20)),
  );
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    db.item.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.item.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-gray-600">
          Export inventory reports as CSV or PDF.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="px-3 py-2 rounded-md border bg-white"
            href="/app/api/reports/csv"
          >
            Export CSV
          </a>
          <a
            className="px-3 py-2 rounded-md border bg-white"
            href="/app/api/reports/pdf"
          >
            Export PDF
          </a>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="font-medium mb-2">Preview</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-left p-2">Category</th>
                <th className="text-right p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.sku ?? "-"}</td>
                  <td className="p-2 text-right">{it.quantity}</td>
                  <td className="p-2">{it.category?.name ?? "-"}</td>
                  <td className="p-2 text-right">
                    {it.price ? `$${it.price}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            Page {page} of {pages} — {total} items
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                className="px-2 py-1 border rounded"
                href={`?page=${page - 1}&pageSize=${pageSize}`}
              >
                Prev
              </Link>
            )}
            {page < pages && (
              <Link
                className="px-2 py-1 border rounded"
                href={`?page=${page + 1}&pageSize=${pageSize}`}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
