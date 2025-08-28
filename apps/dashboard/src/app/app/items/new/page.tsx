import NewItemClient from "./NewItemClient";

export const metadata = { title: "Add New Item — Stockholm IMS" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ⬇️ Tunggu searchParams
  const params = await searchParams;
  const initialSku = typeof params?.sku === "string" ? params.sku : "";

  return <NewItemClient initialSku={initialSku} />;
}
