import { db } from "@stockholm/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const items = await db.item.findMany({ include: { category: true } });
  const rows = [
    ["id", "name", "sku", "quantity", "price", "category", "tags"],
    ...items.map((it) => [
      it.id,
      it.name,
      it.sku ?? "",
      String(it.quantity),
      it.price ? String(it.price) : "",
      it.category?.name ?? "",
      Array.isArray(it.tags) ? (it.tags as unknown as string[]).join("|") : "",
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=inventory.csv`,
    },
  });
}
