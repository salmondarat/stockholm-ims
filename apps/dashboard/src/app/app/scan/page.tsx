"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from "@zxing/library";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const start = async () => {
      try {
        setIsScanning(true);
        const reader = new BrowserMultiFormatReader();
        codeReaderRef.current = reader;

        const cams = await reader.listVideoInputDevices();
        setDevices(cams);

        // Prefer back camera on mobile if available
        const backCam =
          cams.find((d) => /back|rear|environment/i.test(d.label)) ?? cams[0];
        const deviceId = selectedDeviceId ?? backCam?.deviceId;
        setSelectedDeviceId((prev) => prev ?? deviceId);

        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result: Result | undefined, err) => {
            if (result?.getText()) {
              const text = result.getText().trim();
              setValue(text);
              // Stop after first successful scan
              codeReaderRef.current?.reset();
              setIsScanning(false);
            }
            if (err && !(err instanceof NotFoundException)) {
              setError(String(err));
            }
          }
        );
      } catch (e) {
        setIsScanning(false);
        setError(e instanceof Error ? e.message : String(e));
      }
    };
    start();

    return () => {
      codeReaderRef.current?.reset();
    };
    // Intentionally ignore selectedDeviceId change auto-restart to keep stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitch = async (id: string) => {
    try {
      setSelectedDeviceId(id);
      setError(null);
      setIsScanning(true);
      const reader = codeReaderRef.current ?? new BrowserMultiFormatReader();
      codeReaderRef.current = reader;
      reader.reset();
      await reader.decodeFromVideoDevice(
        id,
        videoRef.current!,
        (result: Result | undefined, err) => {
          if (result?.getText()) {
            const text = result.getText().trim();
            setValue(text);
            reader.reset();
            setIsScanning(false);
          }
          if (err && !(err instanceof NotFoundException)) {
            setError(String(err));
          }
        }
      );
    } catch (e) {
      setIsScanning(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Scan</h1>
        <Link href="/app" className="text-sm underline">
          Back to App
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {devices.length > 1 && (
          <select
            className="border rounded-md px-3 py-2"
            value={selectedDeviceId}
            onChange={(e) => handleSwitch(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>
        )}

        <div className="rounded-xl overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        <label className="block text-sm">Detected Value</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Auto-filled from camera"
        />
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/app/items/new?sku=${encodeURIComponent(value)}`}
            className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            aria-disabled={!value}
          >
            Create Item with SKU
          </Link>
          <Link
            href={`/app/items?sku=${encodeURIComponent(value)}`}
            className="px-3 py-2 rounded-md border"
            aria-disabled={!value}
          >
            Search Items by SKU
          </Link>
          <button
            className="px-3 py-2 rounded-md border"
            onClick={() => {
              setValue("");
              setError(null);
              setIsScanning(false);
              // Restart scanning on current device
              if (selectedDeviceId) {
                handleSwitch(selectedDeviceId);
              }
            }}
          >
            Rescan
          </button>
        </div>
      </div>

      {!isScanning && !value && (
        <p className="text-sm text-muted-foreground">
          Point your camera at a barcode/QR code…
        </p>
      )}
    </div>
  );
}

