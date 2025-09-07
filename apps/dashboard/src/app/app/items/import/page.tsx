"use client";

import { useState } from "react";

export default function ImportItemsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/app/api/items/import", { method: "POST", body: fd });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Bulk Import</h1>
      <div className="rounded-xl border bg-white p-5 space-y-3 max-w-xl">
        <a className="px-3 py-2 rounded-md border bg-white inline-block" href="/app/api/items/import/template">Download Template (.xlsx)</a>
        <form onSubmit={onSubmit} className="space-y-3">
          <input type="file" name="file" accept=".xlsx,.xls" required />
          <button className="px-3 py-2 rounded-md bg-[#280299] text-white" disabled={loading}>{loading ? "Uploading..." : "Import"}</button>
        </form>
        {result && (
          <div className="text-sm text-gray-700">
            <div>Inserted: {result.inserted ?? 0}</div>
            <div>Skipped: {result.skipped ?? 0}</div>
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <details className="mt-2">
                <summary>Errors</summary>
                <ul className="list-disc pl-5">
                  {result.errors.map((e: any, i: number) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

