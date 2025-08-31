"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import UploadMedia from "@/components/UploadMedia";
import { updateItemAction, type UpdateItemState } from "../../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function EditItemClient({
  item,
  media,
  primaryPhotoUrl = null,
  s3Enabled = false,
}: {
  item: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    location: string;
    condition: string;
    lowStockThreshold: number;
    tags: string[];
  };
  media: Array<{ id: string; url: string }>;
  primaryPhotoUrl?: string | null;
  s3Enabled?: boolean;
}) {
  const [state, formAction] = useActionState<UpdateItemState, FormData>(updateItemAction, { ok: false });
  const formRef = useRef<HTMLFormElement | null>(null);
  const [storage, setStorage] = useState<"local" | "s3">(s3Enabled ? "s3" : "local");
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [ordered, setOrdered] = useState(media);
  const [coverId, setCoverId] = useState<string | null>(
    media.find((m) => m.url === primaryPhotoUrl)?.id || media[0]?.id || null
  );
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(t);
  }, [state.ok]);

  const toggleRemove = (id: string) =>
    setRemoved((prev) => ({ ...prev, [id]: !prev[id] }));

  const visible = ordered.filter((m) => !removed[m.id]);
  const move = (id: string, dir: -1 | 1) => {
    setOrdered((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      const nidx = idx + dir;
      if (nidx < 0 || nidx >= arr.length) return prev;
      const [it] = arr.splice(idx, 1);
      arr.splice(nidx, 0, it);
      return arr;
    });
  };

  return (
    <main className="p-6 space-y-6">
      {showSaved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-green-600 text-white px-3 py-2 shadow-lg">
          <span>Item updated successfully</span>
          <button
            type="button"
            className="ml-1 rounded bg-green-700/60 px-1 py-0.5 text-xs"
            onClick={() => setShowSaved(false)}
          >
            Close
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Item</h1>
        <Link href="/app/items" className="underline text-sm">
          Back to Items
        </Link>
      </div>

      <form ref={formRef} action={formAction} className="max-w-xl space-y-4">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input name="name" required defaultValue={item.name} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input name="sku" defaultValue={item.sku} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Quantity *</label>
            <input type="number" name="quantity" min={0} defaultValue={item.quantity} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Low-stock Threshold</label>
            <input type="number" name="lowStockThreshold" min={0} defaultValue={item.lowStockThreshold} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input name="location" defaultValue={item.location} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Condition</label>
            <input name="condition" defaultValue={item.condition} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Tags</label>
          <input name="tags" defaultValue={item.tags.join(", ")} className="w-full border rounded px-3 py-2" />
          <p className="text-xs text-gray-500 mt-1">cable, usb-c, black</p>
        </div>

        {/* Existing media list with reorder and cover selector */}
        <div className="space-y-2">
          <label className="block text-sm mb-1">Existing Media</label>
          {ordered.length ? (
            <div className="grid grid-cols-4 gap-3">
              {ordered.map((m, idx) => (
                <div key={m.id} className="relative border rounded-md p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="media" className="h-24 w-full object-cover rounded" />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button type="button" className="px-1.5 py-0.5 border rounded" onClick={() => move(m.id, -1)} disabled={idx === 0}>
                        ↑
                      </button>
                      <button type="button" className="px-1.5 py-0.5 border rounded" onClick={() => move(m.id, 1)} disabled={idx === ordered.length - 1}>
                        ↓
                      </button>
                    </div>
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="coverMediaId" value={m.id} checked={coverId === m.id} onChange={() => setCoverId(m.id)} />
                      <span>Cover</span>
                    </label>
                  </div>
                  <label className="mt-1 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name="removeMediaId"
                      value={m.id}
                      checked={!!removed[m.id]}
                      onChange={() => toggleRemove(m.id)}
                    />
                    <span>Remove</span>
                  </label>
                </div>
              ))}
            </div>
          ) : primaryPhotoUrl ? (
            <div className="grid grid-cols-4 gap-3">
              <div className="relative border rounded-md p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={primaryPhotoUrl} alt="photo" className="h-24 w-full object-cover rounded" />
                <div className="mt-1 text-[10px] text-gray-600">Existing primary photo</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No media yet</p>
          )}

          {/* Hidden inputs to persist order (excluding removed) */}
          <div className="hidden">
            {visible.map((m) => (
              <input key={m.id} type="hidden" name="orderMediaId" value={m.id} />
            ))}
          </div>
        </div>

        {/* Storage selection */}
        <div className="space-y-2">
          <label className="block text-sm mb-1">Upload Storage</label>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="photoStorage" value="local" checked={storage === "local"} onChange={() => setStorage("local")} />
              <span>Local</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="photoStorage" value="s3" checked={storage === "s3"} disabled={!s3Enabled} onChange={() => setStorage("s3")} />
              <span>MinIO (S3)</span>
            </label>
          </div>
          {!s3Enabled && <p className="text-xs text-gray-500">MinIO not configured; using local uploads.</p>}
        </div>

        {/* Add new media */}
        <UploadMedia name="images" label="Add Media" accept="image/*" mode={storage} />

        {state.error && <p className="text-sm text-red-600">Error: {state.error}</p>}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </main>
  );
}
