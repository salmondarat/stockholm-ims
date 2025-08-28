"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddAnother?: () => void; // reset form
};

export default function SuccessDialog({ open, onClose, onAddAnother }: Props) {
  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-lg p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Item created successfully</h3>
        <p className="text-sm text-gray-600">
          Pilih aksi berikut untuk melanjutkan.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            className="px-3 py-2 rounded-md border"
            onClick={() => {
              onClose();
              onAddAnother?.();
            }}
          >
            Add another
          </button>
          <Link
            href="/app/items"
            className="px-3 py-2 rounded-md bg-black text-white"
          >
            Back to Items
          </Link>
        </div>
      </div>
    </div>
  );
}
