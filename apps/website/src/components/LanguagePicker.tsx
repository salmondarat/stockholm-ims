"use client";

import { Globe } from "lucide-react";
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

  const setLanguage = (next: State["lang"]) => {
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

  const toggle = () => setLanguage(lang === "en" ? "id" : "en");

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        aria-label="Change language"
        title={`Language: ${lang.toUpperCase()} (click to switch)`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-500/40 text-gray-200 hover:bg-white/10"
      >
        <Globe className="h-4 w-4" />
      </button>
      <span className="text-xs opacity-80">{lang.toUpperCase()}</span>
    </div>
  );
}
