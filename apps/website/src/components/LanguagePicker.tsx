"use client";

import { useEffect, useState } from "react";

const KEY = "site-locale-currency";

type State = { lang: "en" | "id"; currency?: "USD" | "IDR" | "EUR" };

export default function LanguagePicker() {
  const [lang, setLang] = useState<State["lang"]>("en");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as State;
        setLang(s.lang || "en");
      }
    } catch {}
  }, []);

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = (e.target.value as State["lang"]) || "en";
    setLang(next);
    try {
      const raw = localStorage.getItem(KEY);
      const prev: State = raw
        ? (JSON.parse(raw) as State)
        : { lang: "en", currency: "USD" };
      const merged: State = { ...prev, lang: next };
      localStorage.setItem(KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent("prefs:locale-currency", { detail: merged }),
      );
      document.cookie = `lang=${next}; Max-Age=${365 * 24 * 60 * 60}; Path=/; SameSite=Lax`;
    } catch {}
  };

  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={onChange}
      className="border rounded-md px-2 py-1 bg-transparent text-sm"
    >
      <option value="en">English</option>
      <option value="id">Bahasa</option>
    </select>
  );
}
