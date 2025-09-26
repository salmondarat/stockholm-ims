import { db } from "@stockholm/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET() {
  const items = await db.item.findMany({
    include: { category: true },
    take: 100,
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait in points
  const { width } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const margin = 40;
  let y = 800;
  page.drawText("Stockholm IMS", { x: margin, y, size: 12, font, color: rgb(0.16, 0.01, 0.6) });
  page.drawText("Inventory Report", { x: margin + 140, y, size: 18, font, color: rgb(0.16, 0.01, 0.6) });
  y -= 24;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });
  y -= 16;

  const header = ["Name", "SKU", "Qty", "Category", "Price"];
  const col = [margin, margin + 220, margin + 350, margin + 400, margin + 480];
  page.drawText(header[0]!, { x: col[0], y, size: 10, font });
  page.drawText(header[1]!, { x: col[1], y, size: 10, font });
  page.drawText(header[2]!, { x: col[2], y, size: 10, font });
  page.drawText(header[3]!, { x: col[3], y, size: 10, font });
  page.drawText(header[4]!, { x: col[4], y, size: 10, font });
  y -= 14;

  for (const it of items) {
    if (y < 60) {
      y = 800;
      const p = pdf.addPage([595.28, 841.89]);
      p.drawText("Stockholm IMS", { x: margin, y, size: 12, font, color: rgb(0.16, 0.01, 0.6) });
      p.drawText("Inventory Report (cont.)", { x: margin + 140, y, size: 14, font });
      y -= 24;
    }
    page.drawText(it.name, { x: col[0], y, size: 10, font });
    page.drawText(it.sku ?? "-", { x: col[1], y, size: 10, font });
    page.drawText(String(it.quantity), { x: col[2], y, size: 10, font });
    page.drawText(it.category?.name ?? "-", { x: col[3], y, size: 10, font });
    page.drawText(it.price ? `$${it.price}` : "-", {
      x: col[4],
      y,
      size: 10,
      font,
    });
    y -= 14;
  }

  // Footer page numbers
  const pages = pdf.getPages();
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i];
    p!.drawText(`${i + 1} / ${totalPages}`, { x: width - margin - 40, y: 30, size: 10, font, color: rgb(0.4,0.4,0.5) });
  }

  const bytes = await pdf.save();
  return new Response(bytes as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=inventory.pdf",
    },
  });
}
