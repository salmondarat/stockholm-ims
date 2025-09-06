"use client";

import { useEffect, useState } from "react";
import { getDict, type Dict, type Lang } from "@/i18n";

const KEY = "site-locale-currency";

export default function useI18n() {
  const [lang, setLang] = useState<Lang>("en");
  const [dict, setDict] = useState<Dict>(getDict("en"));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as { lang?: Lang };
        if (s.lang === "id" || s.lang === "en") setLang(s.lang);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setDict(getDict(lang));
  }, [lang]);

  useEffect(() => {
    const onPrefs = (e: Event) => {
      const l = (e as CustomEvent<{ lang?: Lang }>).detail?.lang;
      if (l && l !== lang) setLang(l);
    };
    window.addEventListener("prefs:locale-currency", onPrefs as EventListener);
    return () =>
      window.removeEventListener(
        "prefs:locale-currency",
        onPrefs as EventListener,
      );
  }, [lang]);

  return { lang, dict } as const;
}
