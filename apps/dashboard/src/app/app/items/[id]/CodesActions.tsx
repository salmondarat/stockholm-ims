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
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors group"
          onClick={onDownloadQR}
          disabled={busy}
        >
          <svg
            className="h-4 w-4 group-hover:rotate-12 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          QR Code
        </button>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors group"
          onClick={onDownloadBarcode}
          disabled={busy}
        >
          <svg
            className="h-4 w-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Barcode
        </button>
        <a
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors group"
          href={`/api/items/${id}/label`}
          target="_blank"
          rel="noreferrer"
        >
          <svg
            className="h-4 w-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Label PDF
        </a>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
