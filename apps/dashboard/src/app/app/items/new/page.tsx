import NewItemClient from "./NewItemClient";
import { db } from "@stockholm/db";

export const metadata = { title: "Add New Item — Stockholm IMS" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ⬇️ Tunggu searchParams
  const params = await searchParams;
  const initialSku = typeof params?.sku === "string" ? params.sku : "";

  const categories = await db.category.findMany({
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  const s3Enabled = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );

  return <NewItemClient initialSku={initialSku} s3Enabled={s3Enabled} categories={categories} />;
}
