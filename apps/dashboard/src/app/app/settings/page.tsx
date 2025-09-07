"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [pageSize, setPageSize] = useState<number>(20);
  const [lowDefault, setLowDefault] = useState<number>(0);

  useEffect(() => {
    const ps = Number(localStorage.getItem("settings:pageSize") || 20);
    const ld = Number(localStorage.getItem("settings:lowDefault") || 0);
    setPageSize(ps);
    setLowDefault(ld);
  }, []);

  function save() {
    localStorage.setItem("settings:pageSize", String(pageSize));
    localStorage.setItem("settings:lowDefault", String(lowDefault));
    alert("Settings saved");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-xl border bg-white p-5 space-y-4 max-w-3xl">
        <div>
          <div className="font-medium">Table Page Size</div>
          <div className="text-sm text-gray-600">Items per page for previews.</div>
          <input type="number" min={10} max={100} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="mt-2 rounded-md border px-3 py-2" />
        </div>
        <div>
          <div className="font-medium">Default Low-stock Threshold</div>
          <div className="text-sm text-gray-600">Used when creating new items.</div>
          <input type="number" min={0} value={lowDefault} onChange={(e) => setLowDefault(Number(e.target.value))} className="mt-2 rounded-md border px-3 py-2" />
        </div>
        <button onClick={save} className="px-3 py-2 rounded-md bg-[#280299] text-white">Save</button>
      </div>
    </main>
  );
}
