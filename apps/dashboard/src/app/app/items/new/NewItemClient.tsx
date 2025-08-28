"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom"; // keep this
import { useActionState, useEffect, useRef, useState } from "react"; // <-- useActionState here
import UploadPhoto from "@/components/UploadPhoto";
import SuccessDialog from "@/components/SuccessDialog";
import { createItemAction, type CreateItemState } from "../actions";

const initialState: CreateItemState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? "Saving..." : "Create"}
    </button>
  );
}

export default function NewItemClient({
  initialSku = "",
}: {
  initialSku?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);

  // ⬇️ useActionState replaces useFormState
  const [state, formAction] = useActionState(createItemAction, initialState);

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (state.ok) setShowDialog(true);
  }, [state.ok]);

  const resetForm = () => {
    formRef.current?.reset();
    setShowDialog(false);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add New Item</h1>
        <Link href="/app/items" className="underline text-sm">
          Back to Items
        </Link>
      </div>

      <form ref={formRef} action={formAction} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input
            name="name"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Item name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input
            name="sku"
            defaultValue={initialSku}
            className="w-full border rounded px-3 py-2"
            placeholder="E.g. ABC-123"
          />
          {!!initialSku && (
            <p className="text-xs text-gray-500 mt-1">
              Auto-filled from scanner: <code>{initialSku}</code>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Quantity *</label>
            <input
              type="number"
              name="quantity"
              defaultValue={0}
              min={0}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Low-stock Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              min={0}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              name="location"
              className="w-full border rounded px-3 py-2"
              placeholder="Rack A-1"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Condition</label>
            <input
              name="condition"
              className="w-full border rounded px-3 py-2"
              placeholder="New / Used / etc."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Tags</label>
          <input
            name="tags"
            className="w-full border rounded px-3 py-2"
            placeholder="Contoh: cable,usb-c,black"
          />
          <p className="text-xs text-gray-500 mt-1">
            <code>cable, usb-c, black</code>
          </p>
        </div>

        {/* Upload photo dengan tombol cantik + preview + kamera */}
        <UploadPhoto name="image" label="Photo" accept="image/*" />

        {state.error && (
          <p className="text-sm text-red-600">Error: {state.error}</p>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      <SuccessDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onAddAnother={resetForm}
      />
    </main>
  );
}
