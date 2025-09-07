import XLSX from "xlsx";
import { db } from "@stockholm/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(ab), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });

  let inserted = 0;
  let skipped = 0;
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r.name || "").trim();
    const sku = String(r.sku || "").trim();
    if (!name || !sku) {
      skipped++;
      errors.push({ row: i + 2, error: "Missing name or sku" });
      continue;
    }
    // duplicate checks
    const dupe = await db.item.findFirst({
      where: { OR: [ { name: { equals: name, mode: "insensitive" } }, { sku: { equals: sku, mode: "insensitive" } } ] },
      select: { id: true },
    });
    if (dupe) { skipped++; errors.push({ row: i + 2, error: "Duplicate name or SKU" }); continue; }

    let categoryId: string | null = null;
    if (r.category) {
      const cat = await db.category.upsert({
        where: { slug: String(r.category).toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: { name: String(r.category), slug: String(r.category).toLowerCase().replace(/\s+/g, "-") },
        select: { id: true },
      });
      categoryId = cat.id;
    }

    await db.item.create({
      data: {
        name,
        sku,
        quantity: Number(r.quantity || 0),
        price: r.price ? Number(r.price) : null,
        categoryId,
      },
    });
    inserted++;
  }

  return Response.json({ ok: true, inserted, skipped, errors });
}

