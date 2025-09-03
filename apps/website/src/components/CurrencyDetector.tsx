"use client";

import { useEffect } from "react";

const KEY = "site-locale-currency";

// Minimal mapping by region to supported currencies.
const EUR = new Set([
  "AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"
]);

function detectCurrency(): "USD" | "IDR" | "EUR" {
  try {
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || "en-US";
    const m = /[-_](\w{2})$/i.exec(lang);
    const region = (m ? m[1] : "US").toUpperCase();
    if (region === "ID") return "IDR";
    if (EUR.has(region)) return "EUR";
    return "USD";
  } catch {
    return "USD";
  }
}

export default function CurrencyDetector() {
  useEffect(() => {
    async function run() {
      try {
        const raw = localStorage.getItem(KEY);
        const current = raw ? (JSON.parse(raw) as { lang?: string; currency?: string }) : null;
        if (current && current.currency && current.lang) return;
        // Try server geo endpoint first
        const res = await fetch("/api/geo", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { country: string | null; currency: "USD" | "IDR" | "EUR"; lang: "en" | "id" };
          const merged = { lang: current?.lang || data.lang || "en", currency: current?.currency || data.currency };
          localStorage.setItem(KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent("prefs:locale-currency", { detail: merged }));
          return;
        }
      } catch {}
      // Fallback to navigator-language heuristic
      try {
        const raw = localStorage.getItem(KEY);
        const current = raw ? JSON.parse(raw) as { lang?: string; currency?: string } : null;
        const detected = detectCurrency();
        const merged = { lang: (current?.lang as any) || "en", currency: current?.currency || detected };
        localStorage.setItem(KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("prefs:locale-currency", { detail: merged }));
      } catch {}
    }
    run();
  }, []);
  return null;
}
