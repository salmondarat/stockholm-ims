"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from "@zxing/library";
import Link from "next/link";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [sku, setSku] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const start = async () => {
      try {
        setIsScanning(true);
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        const devices = await codeReader.listVideoInputDevices();
        // Pilih kamera belakang bila ada
        const backCam =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ??
          devices[0];

        await codeReader.decodeFromVideoDevice(
          backCam?.deviceId ?? undefined,
          videoRef.current!,
          (result: Result | undefined, err) => {
            if (result?.getText()) {
              const text = result.getText().trim();
              setSku(text);
              // Hentikan scanning setelah sukses
              codeReaderRef.current?.reset();
              setIsScanning(false);
            }
            if (err && !(err instanceof NotFoundException)) {
              setError(String(err));
            }
          }
        );
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError(String(e));
        }
        setIsScanning(false);
      }
    };
    start();

    return () => {
      codeReaderRef.current?.reset();
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Scan Barcode / QR</h1>
        <Link href="/app/items" className="text-sm underline">
          Back to Items
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">Camera/Scan error: {error}</p>
      )}
      <div className="space-y-2">
        <label className="block text-sm">Detected SKU</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Auto-filled from camera"
        />
        <div className="flex gap-2">
          <Link
            href={`/app/items/new?sku=${encodeURIComponent(sku)}`}
            className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            aria-disabled={!sku}
          >
            Create Item with this SKU
          </Link>
          <Link
            href={`/app/items?sku=${encodeURIComponent(sku)}`}
            className="px-3 py-2 rounded-md border"
            aria-disabled={!sku}
          >
            Search by SKU
          </Link>
        </div>
      </div>

      {!isScanning && !sku && (
        <p className="text-sm text-muted-foreground">
          Point your camera to a code…
        </p>
      )}
    </div>
  );
}
