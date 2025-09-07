"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
};

export default function WorkflowsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/app/api/workflows/low-stock", { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((d: { items?: Item[] }) => setItems(d.items ?? []))
      .catch((e) => {
        if ((e as any)?.name !== "AbortError") setError("Failed to load");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Workflows</h1>
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Low-stock rule</div>
            <div className="text-sm text-gray-600">
              Shows items where quantity ≤ threshold.
            </div>
          </div>
          <a className="text-sm underline" href="/app/items?filter=low">
            View items
          </a>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.name}</td>
                  <td className="p-2 text-right">{it.quantity}</td>
                  <td className="p-2 text-right">{it.lowStockThreshold}</td>
                </tr>
              ))}
              {!items.length && !loading && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={3}>
                    All good — nothing below threshold.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </div>
      </div>
    </main>
  );
}
