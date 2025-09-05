import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@stockholm/db";
import { auth } from "@/lib/auth";
import { summarizeOptions, listVariantQuantities } from "@/lib/options";

export const runtime = "nodejs"; // memastikan Buffer tersedia

export async function GET() {
  // Require authenticated session
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // 1) Ambil data
  let data: Array<{
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    location: string | null;
    condition: string | null;
    photoUrl: string | null;
    tags: unknown;
    price: number | null;
    lowStockThreshold: number | null;
    category?: { name: string } | null;
    options?: unknown;
    variants: Array<{ attrs: Record<string, string>; qty: number; sku?: string }>;
  }> = [];
  try {
    const rows = await db.item.findMany({
      orderBy: { name: "asc" },
      include: {
        category: { select: { name: true } },
        variants: { select: { attrs: true, qty: true, sku: true } },
      },
    });
    data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      quantity: r.quantity,
      location: r.location,
      condition: r.condition,
      photoUrl: r.photoUrl,
      tags: r.tags,
      price: (r as unknown as { price?: unknown }).price == null ? null : Number((r as unknown as { price?: unknown }).price as unknown),
      lowStockThreshold: (r as unknown as { lowStockThreshold: number | null }).lowStockThreshold ?? 0,
      category: r.category as { name: string } | null,
      options: (r as unknown as { options: unknown }).options,
      variants: (r as unknown as { variants: Array<{ attrs: Record<string, string>; qty: number; sku?: string }> }).variants,
    }));
  } catch {
    const rows = await db.item.findMany({
      orderBy: { name: "asc" },
      include: { category: { select: { name: true } } },
    });
    data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      quantity: r.quantity,
      location: r.location,
      condition: r.condition,
      photoUrl: r.photoUrl,
      tags: r.tags,
      price: (r as unknown as { price?: unknown }).price == null ? null : Number((r as unknown as { price?: unknown }).price as unknown),
      lowStockThreshold: (r as unknown as { lowStockThreshold: number | null }).lowStockThreshold ?? 0,
      category: r.category as { name: string } | null,
      options: (r as unknown as { options: unknown }).options,
      variants: listVariantQuantities(r.options),
    }));
  }
  const lowStock = data.filter(
    (x) =>
      (x.lowStockThreshold ?? 0) > 0 && x.quantity <= (x.lowStockThreshold ?? 0)
  );

  // 2) Siapkan dokumen PDF (A4)
  const pdf = await PDFDocument.create();
  const A4: [number, number] = [595.28, 841.89];
  const margin = 40;

  // Embed font sekali saja
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Util untuk membuat halaman baru + header tabel
  const createPage = () => {
    const page = pdf.addPage(A4);
    const { height, width } = page.getSize();
    let y = height - margin;

    // Title halaman pertama saja akan ditulis oleh caller (opsional).
    // Di halaman-halaman berikut hanya tabel.

    // Kembalikan helper menggambar header
    const drawTableHeader = () => {
      const headers = [
        "Name",
        "SKU",
        "Category",
        "Qty",
        "Price",
        "Options",
        "Location",
        "Condition",
      ];
      const colX = [margin, 150, 230, 300, 340, 390, 470, 520] as const;

      page.drawText(headers[0], { x: colX[0], y, size: 11, font: fontBold });
      page.drawText(headers[1], { x: colX[1], y, size: 11, font: fontBold });
      page.drawText(headers[2], { x: colX[2], y, size: 11, font: fontBold });
      page.drawText(headers[3], { x: colX[3], y, size: 11, font: fontBold });
      page.drawText(headers[4], { x: colX[4], y, size: 11, font: fontBold });
      page.drawText(headers[5], { x: colX[5], y, size: 11, font: fontBold });
      y -= 14;
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 10;

      return { colX, yRef: () => y, setY: (v: number) => (y = v) };
    };

    return {
      page,
      yRef: () => y,
      setY: (v: number) => (y = v),
      drawTableHeader,
    };
  };

  // Halaman pertama + judul + ringkasan
  let { page, yRef, setY, drawTableHeader } = createPage();
  let y = yRef();

  page.drawText("Inventory Report", { x: margin, y, size: 20, font: fontBold });
  y -= 26;
  page.drawText(`Total items: ${data.length}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= 16;
  page.drawText(`Low-stock items: ${lowStock.length}`, {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0.8, 0, 0),
  });
  y -= 24;
  setY(y);

  // Header tabel pertama
  const header1 = drawTableHeader();
  let colX = header1.colX;
  y = header1.yRef();

  // Util gambar 1 row
  type ItemRow = {
    name: string;
    sku: string | null;
    category?: { name: string } | null;
    quantity: number;
    lowStockThreshold?: number | null;
    location?: string | null;
    condition?: string | null;
    price?: number | null;
    options?: unknown;
    variants: Array<{ attrs: Record<string, string>; qty: number; sku?: string }>;
  };

  const drawRow = (row: ItemRow) => {
    const text = (v: unknown) => (v == null ? "" : String(v));
    page.drawText(text(row.name), { x: colX[0], y, size: 10, font });
    page.drawText(text(row.sku), { x: colX[1], y, size: 10, font });
    page.drawText(text(row.category?.name), { x: colX[2], y, size: 10, font });
    const qty = row.variants.reduce((acc, v) => acc + (Number.isFinite(v.qty) ? v.qty : 0), 0) || row.quantity || 0;
    page.drawText(String(qty), { x: colX[3], y, size: 10, font });
    page.drawText(`$${Number(row.price ?? 0).toFixed(2)}`, { x: colX[4], y, size: 10, font });
    page.drawText(summarizeOptions(row.options, 40), { x: colX[5], y, size: 9, font });
    page.drawText(text(row.location), { x: colX[6], y, size: 10, font });
    page.drawText(text(row.condition), { x: colX[7], y, size: 10, font });

    // summarizer imported from util
  };

  // 3) Loop data + pagination
  for (const row of data) {
    // Jika ketinggian sudah mepet, buat halaman baru + header tabel
    if (y < margin + 40) {
      ({ page, yRef, setY, drawTableHeader } = createPage());
      const header = drawTableHeader();
      colX = header.colX;
      y = header.yRef();
    }
    drawRow(row);
    y -= 14;
  }

  // 4) Kirim sebagai Buffer (Node runtime)
  const bytes = await pdf.save(); // Uint8Array
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
