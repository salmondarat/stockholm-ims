import { db } from "@stockholm/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const items = await db.item.findMany({
    where: { quantity: { lte: 10 } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, quantity: true, lowStockThreshold: true },
    take: 50,
  });
  return Response.json({ items });
}
