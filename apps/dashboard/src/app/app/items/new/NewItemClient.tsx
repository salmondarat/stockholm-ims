"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom"; // keep this
import { useActionState, useEffect, useRef, useState } from "react"; // <-- useActionState here
import UploadMedia from "@/components/UploadMedia";
import CategoryCombobox from "@/components/CategoryCombobox";
import SuccessDialog from "@/components/SuccessDialog";
import { createItemAction, type CreateItemState } from "../actions";
import OptionsBuilder from "@/components/OptionsBuilder";

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
  s3Enabled = false,
  categories = [],
}: {
  initialSku?: string;
  s3Enabled?: boolean;
  categories?: Array<{ id: string; name: string; parentId: string | null }>;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);

  // ⬇️ useActionState replaces useFormState
  const [state, formAction] = useActionState(createItemAction, initialState);

  const [showDialog, setShowDialog] = useState(false);
  const [storage, setStorage] = useState<"local" | "s3">(
    s3Enabled ? "s3" : "local"
  );
  const [category, setCategory] = useState<string>("");
  const [sku, setSku] = useState<string>(initialSku);
  const [variantInfo, setVariantInfo] = useState<{ hasVariants: boolean; sumQty: number }>({ hasVariants: false, sumQty: 0 });

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
          <label className="block text-sm mb-1">SKU *</label>
          <input
            name="sku"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
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
              className="w-full border rounded px-3 py-2 disabled:bg-gray-50"
              readOnly={variantInfo.hasVariants}
            />
            {variantInfo.hasVariants && (
              <p className="text-xs text-gray-500 mt-1">Derived from variants: {variantInfo.sumQty}</p>
            )}
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
            <label className="block text-sm mb-1">Price</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min={0}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 199.99"
            />
          </div>
          <CategoryCombobox
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            value={category}
            onChange={setCategory}
            name="category"
            label="Category"
          />
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

        <OptionsBuilder baseSku={sku} onSummaryChange={setVariantInfo} />

        {/* Upload multiple media (images) */}
        <UploadMedia name="images" label="Media (images)" accept="image/*" mode={storage} />

        {/* Storage target selection: Local vs MinIO (S3) */}
        <div className="space-y-2">
          <label className="block text-sm mb-1">Upload Storage</label>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="photoStorage"
                value="local"
                checked={storage === "local"}
                onChange={() => setStorage("local")}
              />
              <span>Local</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="photoStorage"
                value="s3"
                checked={storage === "s3"}
                disabled={!s3Enabled}
                onChange={() => setStorage("s3")}
              />
              <span>MinIO (S3)</span>
            </label>
          </div>
          {!s3Enabled && (
            <p className="text-xs text-gray-500">
              MinIO not configured; using local uploads.
            </p>
          )}
        </div>

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
