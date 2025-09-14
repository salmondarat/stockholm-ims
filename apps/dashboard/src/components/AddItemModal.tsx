"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  createItemAction,
  type CreateItemState,
} from "@/app/app/items/actions";
import UploadMedia from "@/components/UploadMedia";
import CategoryCombobox from "@/components/CategoryCombobox";
import OptionsBuilder from "@/components/OptionsBuilder";
import { useRouter } from "next/navigation";

const initialState: CreateItemState = { ok: false };

export default function AddItemModal({
  categories = [],
  s3Enabled = false,
  asButton = true,
  buttonClass = "px-3 py-2 rounded-md bg-[#280299] text-white",
}: {
  categories?: Array<{ id: string; name: string; parentId?: string | null }>;
  s3Enabled?: boolean;
  asButton?: boolean;
  buttonClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CreateItemState>(initialState);
  const formAction = async (formData: FormData) => {
    const next = await createItemAction(state, formData);
    setState(next);
  };
  const formRef = useRef<HTMLFormElement | null>(null);
  const [storage, setStorage] = useState<"local" | "s3">(
    s3Enabled ? "s3" : "local",
  );
  const [category, setCategory] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [variantInfo, setVariantInfo] = useState<{
    hasVariants: boolean;
    sumQty: number;
  }>({ hasVariants: false, sumQty: 0 });
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  const trigger = (
    <button onClick={() => setOpen(true)} className={buttonClass}>
      Add Product
    </button>
  );

  return (
    <>
      {asButton && trigger}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="font-semibold">Add Item</div>
                <button
                  aria-label="Close"
                  className="h-8 w-8 grid place-items-center rounded-md hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 max-h-[78vh] overflow-auto">
                <form ref={formRef} action={formAction} className="space-y-4">
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <p className="text-xs text-gray-500 mt-1">
                          Derived from variants: {variantInfo.sumQty}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Low-stock Threshold
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        min={0}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      categories={categories.map((c) => ({
                        id: c.id,
                        name: c.name,
                      }))}
                      value={category}
                      onChange={setCategory}
                      name="category"
                      label="Category"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="cable, usb-c, black"
                    />
                  </div>

                  <OptionsBuilder
                    baseSku={sku}
                    onSummaryChange={setVariantInfo}
                  />

                  <UploadMedia
                    name="images"
                    label="Media (images)"
                    accept="image/*"
                    mode={storage}
                  />

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
                  </div>

                  {state.error && (
                    <p className="text-sm text-red-600">{state.error}</p>
                  )}

                  <input type="hidden" name="optionsEnabled" value="1" />
                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-3 py-2 rounded-md border"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-[#280299] text-white"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
