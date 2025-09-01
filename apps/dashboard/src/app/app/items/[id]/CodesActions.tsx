"use client";

import { useState } from "react";

type Props = {
  id: string;
};

export default function CodesActions({ id }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/items/${id}/codes`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = (await res.json()) as {
        qr: string;
        barcode: string;
        item: { id: string; name: string; sku: string | null };
      };
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onDownloadQR = async () => {
    const data = await fetchCodes();
    if (!data) return;
    const name = data.item.sku || data.item.id;
    triggerDownload(data.qr, `qr-${name}.png`);
  };

  const onDownloadBarcode = async () => {
    const data = await fetchCodes();
    if (!data) return;
    const name = data.item.sku || data.item.id;
    triggerDownload(data.barcode, `barcode-${name}.png`);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          className="px-3 py-2 rounded-md border disabled:opacity-50"
          onClick={onDownloadQR}
          disabled={busy}
        >
          Download QR PNG
        </button>
        <button
          className="px-3 py-2 rounded-md border disabled:opacity-50"
          onClick={onDownloadBarcode}
          disabled={busy}
        >
          Download Barcode PNG
        </button>
        <a
          className="px-3 py-2 rounded-md bg-blue-600 text-white"
          href={`/api/items/${id}/label`}
          target="_blank"
          rel="noreferrer"
        >
          Download Label PDF
        </a>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

