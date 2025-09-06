import { NextRequest, NextResponse } from "next/server";
import { db } from "@stockholm/db";
import { auth } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "nodejs";

async function generateQrPng(text: string, size = 200) {
  return QRCode.toBuffer(text, {
    type: "png",
    margin: 1,
    width: size,
    errorCorrectionLevel: "M",
  });
}

async function generateBarcodePng(
  text: string,
  width = 300,
  height = 70,
  includeText = true,
) {
  const bwipjs = (await import("bwip-js")).default as unknown as {
    toBuffer: (opts: Record<string, unknown>) => Promise<Buffer>;
  };
  return bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 3,
    width,
    height,
    includetext: includeText,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await ctx.params;
  const item = await db.item.findUnique({ where: { id } });
  if (!item) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const codeText = item.sku?.trim() || item.id;
  const qrPayload = `stockholm:item:${item.id}`;

  // Generate assets
  const [qrBuf, barcodeBuf] = await Promise.all([
    generateQrPng(qrPayload, 200),
    generateBarcodePng(codeText, 320, 80, true),
  ]);

  // Create a compact label page (roughly 4x3 inches -> 288x216 pt)
  const width = 288;
  const height = 216;
  const margin = 12;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([width, height]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Embed images
  const qrImage = await pdf.embedPng(qrBuf);
  const barcodeImage = await pdf.embedPng(barcodeBuf);

  // Layout: QR left, item text top-right, barcode bottom
  const qrSize = 120; // square
  const qrX = margin;
  const qrY = height - margin - qrSize;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  // Item text
  const textX = qrX + qrSize + 10;
  let textY = height - margin - 18;
  page.drawText(item.name, {
    x: textX,
    y: textY,
    size: 14,
    font: fontBold,
  });
  textY -= 18;
  if (item.sku) {
    page.drawText(`SKU: ${item.sku}`, { x: textX, y: textY, size: 12, font });
    textY -= 14;
  }
  if (item.location) {
    page.drawText(`Loc: ${item.location}`, {
      x: textX,
      y: textY,
      size: 11,
      font,
    });
    textY -= 14;
  }
  if (item.condition) {
    page.drawText(`Cond: ${item.condition}`, {
      x: textX,
      y: textY,
      size: 11,
      font,
    });
    textY -= 14;
  }

  // Barcode area bottom, centered
  const barWidth = Math.min(260, width - margin * 2);
  const barHeight = 80;
  const barX = (width - barWidth) / 2;
  const barY = margin + 8;
  page.drawImage(barcodeImage, {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
  });

  // Optional border for label edges
  page.drawRectangle({
    x: 1,
    y: 1,
    width: width - 2,
    height: height - 2,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.8,
  });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="item-label-${item.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
