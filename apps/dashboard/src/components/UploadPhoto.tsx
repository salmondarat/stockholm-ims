"use client";

import { useEffect, useId, useRef, useState } from "react";

type UploadMode = "local" | "s3";

type Props = {
  name?: string;
  label?: string;
  accept?: string;
  // contoh: "image/*"
  initialPreviewUrl?: string | null;
  // control client-side direct upload
  mode?: UploadMode;
  presignPath?: string; // default: /api/uploads/presign
};

export default function UploadPhoto({
  name = "image",
  label = "Photo",
  accept = "image/*",
  initialPreviewUrl = null,
  mode = "local",
  presignPath = "/api/uploads/presign",
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const keyRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "uploading" }
    | { kind: "uploaded" }
    | { kind: "error"; msg: string }
  >({ kind: "idle" });

  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onPick = () => {
    // Reset input so selecting the same file name fires onChange
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };
  const onClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (keyRef.current) keyRef.current.value = "";
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName("");
    setStatus({ kind: "idle" });
  };

  useEffect(() => {
    // switching away from s3 clears any prepared key
    if (mode !== "s3" && keyRef.current) keyRef.current.value = "";
  }, [mode]);

  // Prevent form submit while uploading to S3
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onSubmit = (e: Event) => {
      if (mode === "s3" && status.kind === "uploading") {
        e.preventDefault();
        e.stopPropagation();
        setStatus({ kind: "error", msg: "Please wait for upload to finish" });
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [mode, status.kind]);

  async function directUpload(file: File) {
    try {
      setStatus({ kind: "uploading" });
      const contentType = file.type || "application/octet-stream";
      const fromName = (file.name.split(".").pop() || "").toLowerCase();
      const fallbackExt =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
          ? "webp"
          : "jpg";
      const ext = /^[a-z0-9]+$/i.test(fromName) ? fromName : fallbackExt;

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

      if (keyRef.current) keyRef.current.value = key;
      // prevent form from streaming file
      if (inputRef.current) inputRef.current.value = "";
      setStatus({ kind: "uploaded" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setStatus({ kind: "error", msg });
    }
  }

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      onClear();
      return;
    }
    if (!ALLOWED.has(file.type)) {
      setStatus({ kind: "error", msg: "Only JPG/PNG/WEBP allowed" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setStatus({ kind: "error", msg: "Max file size is 8MB" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    if (mode === "s3") {
      await directUpload(file);
    } else {
      setStatus({ kind: "idle" });
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm mb-1">
        {label}
      </label>

      {/* hidden key sent when direct-upload success */}
      <input type="hidden" name="photoKey" ref={keyRef} />

      {/* input asli disembunyikan */}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        // capture minta kamera belakang di mobile (tidak semua device patuh, tapi membantu)
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
          {preview ? "Change Photo" : "Choose Photo"}
        </button>
        {fileName ? (
          <span className="text-xs text-gray-600 truncate max-w-[16rem]">
            {fileName}
          </span>
        ) : (
          <span className="text-xs text-gray-400">No file chosen</span>
        )}
        {preview && (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-xs px-2 py-1 rounded border"
          >
            Remove
          </button>
        )}
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="mt-2 h-28 w-28 object-cover rounded-md border"
        />
      )}

      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span>Max 8 MB. Supported: JPG/PNG/WEBP.</span>
        {mode === "s3" && status.kind === "uploading" && (
          <span className="text-blue-600">Uploading to MinIO…</span>
        )}
        {mode === "s3" && status.kind === "uploaded" && (
          <span className="text-green-600">Uploaded to MinIO</span>
        )}
        {status.kind === "error" && (
          <span className="text-red-600">{status.msg}</span>
        )}
      </div>
    </div>
  );
}
