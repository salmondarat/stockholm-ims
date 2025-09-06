"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  name?: string; // form field name for the chosen text value
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

// Lightweight combobox (shadcn-style) without external deps.
export default function CategoryCombobox({
  categories,
  name = "category",
  placeholder = "Type to search or create…",
  value,
  onChange,
  label = "Category",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [selected, setSelected] = useState(value ?? "");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(value ?? "");
    setSelected(value ?? "");
  }, [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? categories.filter((c) => c.name.toLowerCase().includes(q))
      : categories;
    // ensure uniqueness by name
    const map = new Map<string, Category>();
    for (const c of base) if (!map.has(c.name)) map.set(c.name, c);
    return Array.from(map.values()).slice(0, 50);
  }, [categories, query]);

  const exact = categories.find(
    (c) => c.name.trim().toLowerCase() === query.trim().toLowerCase(),
  );

  const choose = (text: string) => {
    setSelected(text);
    setQuery(text);
    setOpen(false);
    onChange?.(text);
    // focus back on input for accessibility
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="w-full">
      {label && (
        <label className="block text-sm mb-1" htmlFor={`${name}-combobox`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={`${name}-combobox`}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange?.(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2"
          autoComplete="off"
        />
        <input type="hidden" name={name} value={selected} />
        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow">
            <div className="max-h-60 overflow-auto py-1 text-sm">
              {items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => choose(c.name)}
                >
                  {c.name}
                </button>
              ))}
              {!items.length && (
                <div className="px-3 py-2 text-gray-500">No results</div>
              )}
            </div>
            {query.trim() && !exact && (
              <div className="border-t p-2 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-600 truncate">
                  Create new:{" "}
                  <span className="font-medium">{query.trim()}</span>
                </div>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border"
                  onClick={() => choose(query.trim())}
                >
                  Use
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
