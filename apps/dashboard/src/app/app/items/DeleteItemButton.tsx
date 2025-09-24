"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
interface DeleteItemButtonProps {
  itemName: string;
  onDelete: () => Promise<void>;
  className?: string;
}

export default function DeleteItemButton({
  itemName,
  onDelete,
  className = "inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-500 transition-colors hover:bg-red-50",
}: DeleteItemButtonProps) {
  const [isPending, startTransition] = useTransition();
  const classes = [
    className,
    isPending ? "opacity-50 pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      aria-label="Delete item"
      className={classes}
      onClick={() => {
        if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
        startTransition(() => {
          void onDelete();
        });
      }}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
