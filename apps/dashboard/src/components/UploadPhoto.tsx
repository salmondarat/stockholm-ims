"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  name?: string;
  label?: string;
  accept?: string;
  // contoh: "image/*"
  initialPreviewUrl?: string | null;
};

export default function UploadPhoto({
  name = "image",
  label = "Photo",
  accept = "image/*",
  initialPreviewUrl = null,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onPick = () => inputRef.current?.click();
  const onClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName("");
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      onClear();
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm mb-1">
        {label}
      </label>

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

      <p className="text-xs text-gray-500">
        Maks 8&nbsp;MB. Format yang didukung: JPG/PNG/WEBP.
      </p>
    </div>
  );
}
