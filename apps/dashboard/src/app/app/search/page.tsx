import { db } from "@stockholm/db";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams?.q || "").trim();
  const items = q
    ? await db.item.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { category: true },
        take: 50,
      })
    : [];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>
      <form className="rounded-xl border bg-white p-5 max-w-3xl">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search items, tags, categories…"
          className="w-full rounded-md border px-3 py-2 outline-none"
        />
        <div className="text-sm text-gray-500 mt-3">
          Showing {items.length} result(s){q ? ` for "${q}"` : ""}.
        </div>
      </form>

      {!!items.length && (
        <div className="rounded-xl border bg-white p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-right p-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b">
                  <td className="p-2">
                    <Link
                      href={`/app/items/${it.id}`}
                      className="hover:underline"
                    >
                      {it.name}
                    </Link>
                    {it.sku && (
                      <div className="text-[11px] text-gray-500">
                        SKU: {it.sku}
                      </div>
                    )}
                  </td>
                  <td className="p-2">{it.category?.name ?? "-"}</td>
                  <td className="p-2 text-right">{it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
