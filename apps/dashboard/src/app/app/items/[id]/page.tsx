import Link from "next/link";
import { db } from "@stockholm/db";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.item.findUnique({ where: { id } });
  if (!item) return <div className="p-6">Item not found.</div>;

  const media = (await (db as any).itemMedia.findMany({
    where: { itemId: id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true },
  })) as Array<{ id: string; url: string }>;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link className="underline" href={`/app/items/${id}/edit`}>
            Edit
          </Link>
          <Link className="underline" href="/app/items">
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">SKU</div>
          <div className="text-base">{item.sku ?? "-"}</div>
          <div className="text-sm text-gray-500 mt-4">Quantity</div>
          <div className="text-base">{item.quantity}</div>
          <div className="text-sm text-gray-500 mt-4">Low-stock threshold</div>
          <div className="text-base">{item.lowStockThreshold ?? 0}</div>
          <div className="text-sm text-gray-500 mt-4">Location</div>
          <div className="text-base">{item.location ?? "-"}</div>
          <div className="text-sm text-gray-500 mt-4">Condition</div>
          <div className="text-base">{item.condition ?? "-"}</div>
          <div className="text-sm text-gray-500 mt-4">Tags</div>
          <div className="text-base">{Array.isArray(item.tags) ? (item.tags as string[]).join(", ") : "-"}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Gallery</div>
          {media.length ? (
            <div className="grid grid-cols-3 gap-3">
              {media.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} className="h-32 w-full object-cover rounded border" src={m.url} alt="" />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No media</div>
          )}
        </div>
      </div>
    </main>
  );
}

