"use client";

import { useEffect, useId, useRef, useState } from "react";

type UploadMode = "local" | "s3";

type MediaItem = {
  id: string;
  fileName: string;
  preview: string;
  status: "idle" | "uploading" | "uploaded" | "error";
  error?: string;
  key?: string; // S3 key when uploaded
};

type Props = {
  name?: string; // input name for local form files
  label?: string;
  accept?: string;
  mode?: UploadMode;
  presignPath?: string;
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export default function UploadMedia({
  name = "images",
  label = "Media (images)",
  accept = "image/*",
  mode = "local",
  presignPath = "/api/uploads/presign",
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    return () => {
      for (const it of items)
        if (it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    };
  }, [items]);

  // Prevent submit while any upload in progress
  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;
    const onSubmit = (e: Event) => {
      if (mode === "s3" && items.some((i) => i.status === "uploading")) {
        e.preventDefault();
        e.stopPropagation();
        alert("Please wait for media upload to finish");
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [mode, items]);

  const onPick = () => {
    // Reset the input so picking the same file name triggers onChange
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  function validateFile(file: File): string | null {
    const mimeOk = ALLOWED_MIME.has(file.type);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const extOk = ALLOWED_EXT.has(ext);
    if (!mimeOk || !extOk) return "Unsupported file type. Only JPG/PNG/WEBP";
    if (file.size > MAX_SIZE) return "Max file size is 8MB";
    return null;
  }

  async function directUpload(file: File, id: string) {
    try {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "uploading", error: undefined } : i,
        ),
      );
      const contentType = file.type || "application/octet-stream";
      const extRaw = (file.name.split(".").pop() || "").toLowerCase();
      const ext = ALLOWED_EXT.has(extRaw)
        ? extRaw
        : contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
            ? "webp"
            : "jpg";
      const res = await fetch(presignPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, ext }),
      });
      if (!res.ok) throw new Error(`Presign failed (${res.status})`);
      const { url, key } = (await res.json()) as { url: string; key: string };
      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "uploaded", key } : i)),
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "error", error: message } : i,
        ),
      );
    }
  }

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        // push error item immediately
        setItems((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            fileName: file.name,
            preview: "",
            status: "error",
            error: err,
          },
        ]);
        continue;
      }

      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);

      // Add the item first so subsequent updates can find it
      setItems((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          preview,
          status: mode === "s3" ? "uploading" : "idle",
        },
      ]);

      if (mode === "s3") {
        await directUpload(file, id);
      }
    }

    if (mode === "s3") {
      // prevent posting actual binaries
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <label htmlFor={inputId} className="block text-sm mb-1">
        {label}
      </label>

      {/* Hidden inputs for S3 keys */}
      {mode === "s3" &&
        items
          .filter((i) => i.status === "uploaded" && i.key)
          .map((i) => (
            <input key={i.id} type="hidden" name="mediaKey" value={i.key} />
          ))}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple
        capture="environment"
        className="hidden"
        onChange={onChange}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPick}
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          Add Media
        </button>
        <span className="text-xs text-gray-500">
          Max 8 MB each. JPG/PNG/WEBP only.
        </span>
      </div>

      {!!items.length && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.id} className="relative border rounded-md p-2">
              {it.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.preview}
                  alt={it.fileName}
                  className="h-24 w-full object-cover rounded"
                />
              ) : (
                <div className="h-24 w-full grid place-items-center text-xs text-gray-500">
                  {it.fileName}
                </div>
              )}
              <div className="mt-1 flex items-center justify-between text-[10px] text-gray-600">
                <span className="truncate max-w-[8rem]" title={it.fileName}>
                  {it.fileName}
                </span>
                {it.status === "uploading" && (
                  <span className="text-blue-600">uploading…</span>
                )}
                {it.status === "uploaded" && (
                  <span className="text-green-600">ok</span>
                )}
                {it.status === "error" && (
                  <span className="text-red-600">error</span>
                )}
              </div>
              {it.error && (
                <div className="text-[10px] text-red-600 mt-0.5">
                  {it.error}
                </div>
              )}
              <button
                type="button"
                className="absolute top-1 right-1 text-xs px-1.5 py-0.5 border rounded bg-white"
                onClick={() => removeItem(it.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
