import { NextRequest, NextResponse } from "next/server";
import { db } from "@stockholm/db";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";

export const runtime = "nodejs";

// Defer bwip-js import to avoid any ESM interop issues at top-level
async function generateBarcodePng(text: string, width = 480, height = 120) {
  const bwipjs = (await import("bwip-js")).default as unknown as {
    toBuffer: (opts: Record<string, unknown>) => Promise<Buffer>;
  };

  // Use Code 128 for general SKU support (alphanumeric)
  return bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 3,
    width,
    height,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });
}

async function generateQrPng(text: string, size = 256) {
  return QRCode.toBuffer(text, {
    type: "png",
    margin: 1,
    width: size,
    errorCorrectionLevel: "M",
  });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
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

  // Prefer SKU for codes; fallback to id
  const codeText = item.sku?.trim() || item.id;

  // Encode a helpful QR payload (URL-like) so the app can deep-link
  const qrPayload = `stockholm:item:${item.id}`;

  const [qrBuf, barcodeBuf] = await Promise.all([
    generateQrPng(qrPayload, 256),
    generateBarcodePng(codeText, 480, 120),
  ]);

  const qrBase64 = `data:image/png;base64,${qrBuf.toString("base64")}`;
  const barcodeBase64 = `data:image/png;base64,${barcodeBuf.toString("base64")}`;

  return NextResponse.json(
    {
      item: {
        id: item.id,
        name: item.name,
        sku: item.sku ?? null,
      },
      qr: qrBase64,
      barcode: barcodeBase64,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
