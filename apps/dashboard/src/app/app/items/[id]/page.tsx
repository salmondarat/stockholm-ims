import Link from "next/link";
import { db } from "@stockholm/db";
import CodesActions from "./CodesActions";
import { listVariantQuantities } from "@/lib/options";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = await db.item.findUnique({ where: { id } });
  if (!base) return <div className="p-6">Item not found.</div>;
  const dbAny = db as unknown as {
    itemVariant?: {
      findMany: (args: unknown) => Promise<Array<{ itemId: string; attrs: Record<string, string>; qty: number; sku: string | null }>>;
    };
  };
  let variants: Array<{ attrs: Record<string, string>; qty: number; sku?: string }> = [];
  if (dbAny.itemVariant && typeof dbAny.itemVariant.findMany === "function") {
    try {
      const vrows = await dbAny.itemVariant.findMany({
        where: { itemId: id },
        select: { itemId: true, attrs: true, qty: true, sku: true },
      } as unknown);
      variants = vrows.map((v) => ({ attrs: v.attrs, qty: v.qty, sku: v.sku ?? undefined }));
    } catch {
      variants = listVariantQuantities(base.options);
    }
  } else {
    variants = listVariantQuantities(base.options);
  }
  const item = { ...base, variants } as typeof base & { variants: typeof variants };

  const media = (await db.itemMedia.findMany({
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

      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Codes & Label</div>
        <CodesActions id={id} />
      </div>

      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Variants</div>
        {renderOptions(item.options)}
        {(() => {
          const variants = item.variants as Array<{ attrs: Record<string, string>; qty: number; sku?: string }>;
          if (!variants || !variants.length) return null;
          return (
            <div className="mt-3 space-y-1">
              <div className="text-xs text-gray-500">Quantities by variant</div>
              <div className="space-y-1">
                {variants.map((v, i) => (
                  <div key={i} className="text-sm flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(v.attrs).map(([k, val]) => (
                        <span key={k + val} className="px-2 py-0.5 rounded-full border text-xs">{k}: {val}</span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-3">
                      <span>sku: {v.sku ?? '-'}</span>
                      <span>qty: {v.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">SKU</div>
          <div className="text-base">{item.sku ?? "-"}</div>
          <div className="text-sm text-gray-500 mt-4">Quantity</div>
          <div className="text-base">{(() => {
            const sum = item.variants.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0), 0);
            const hasVariants = item.variants.length > 0;
            return hasVariants ? sum : item.quantity;
          })()}</div>
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

function renderOptions(options: unknown) {
  try {
    const obj: Record<string, unknown> | null = options && typeof options === "object" ? (options as Record<string, unknown>) : null;
    if (!obj) return <div className="text-sm text-gray-500">-</div>;
    const entries = Object.entries(obj).filter(
      ([k, v]) => !String(k).startsWith("_") && Array.isArray(v) && (v as unknown[]).length
    ) as Array<[string, string[]]>;
    if (!entries.length) return <div className="text-sm text-gray-500">-</div>;
    return (
      <div className="space-y-2">
        {entries.map(([k, vals]) => (
          <div key={k} className="text-sm">
            <span className="font-medium">{k}:</span>
            <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
              {vals.map((v) => (
                <span key={k + v} className="px-2 py-0.5 rounded-full border text-xs">
                  {v}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return <div className="text-sm text-gray-500">-</div>;
  }
}
export const revalidate = 0; // always render fresh item page
