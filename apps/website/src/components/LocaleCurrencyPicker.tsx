"use client";

import { useEffect, useState } from "react";

const KEY = "site-locale-currency";

type State = { lang: "en" | "id"; currency: "USD" | "IDR" | "EUR" };

export default function LocaleCurrencyPicker() {
  const [state, setState] = useState<State>({ lang: "en", currency: "USD" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
    window.dispatchEvent(
      new CustomEvent("prefs:locale-currency", { detail: state }),
    );
  }, [state]);

  return (
    <div className="hidden sm:flex items-center gap-2 text-sm">
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={state.lang}
        onChange={(e) =>
          setState((s) => ({ ...s, lang: e.target.value as State["lang"] }))
        }
        aria-label="Language"
      >
        <option value="en">English</option>
        <option value="id">Bahasa</option>
      </select>
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={state.currency}
        onChange={(e) =>
          setState((s) => ({
            ...s,
            currency: e.target.value as State["currency"],
          }))
        }
        aria-label="Currency"
      >
        <option value="USD">USD</option>
        <option value="IDR">IDR</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  );
}

export function formatMoney(amount: number, currency: State["currency"]) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
