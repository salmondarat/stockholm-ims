import { db } from "@stockholm/db";
import { listVariantQuantities } from "@/lib/options";
import EditItemClient from "./EditItemClient";

export const metadata = { title: "Edit Item — Stockholm IMS" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await db.item.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      location: true,
      condition: true,
      lowStockThreshold: true,
      tags: true,
      photoUrl: true,
      price: true,
      categoryId: true,
      options: true,
    },
  });
  if (!item) return <div className="p-6">Item not found.</div>;

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
      variants = listVariantQuantities(item.options);
    }
  } else {
    variants = listVariantQuantities(item.options);
  }

  const media = (await db.itemMedia.findMany({
    where: { itemId: id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true },
  })) as { id: string; url: string }[];

  const categories = await db.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  const currentCategoryName = categories.find((c) => c.id === (item.categoryId ?? ""))?.name || "";

  const s3Enabled = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );

  return (
    <EditItemClient
      item={{
        id: item.id,
        name: item.name,
        sku: item.sku ?? "",
        quantity: item.quantity,
        location: item.location ?? "",
        condition: item.condition ?? "",
        lowStockThreshold: item.lowStockThreshold ?? 0,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      }}
      media={media}
      price={item.price ? Number(item.price) : 0}
      categoryName={currentCategoryName}
      optionsJson={item.options ? JSON.stringify(item.options) : ""}
      variants={variants}
      primaryPhotoUrl={item.photoUrl ?? null}
      categories={categories}
      s3Enabled={s3Enabled}
    />
  );
}
