"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney } from "@/components/LocaleCurrencyPicker";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function PricingPage() {
  const { dict } = useI18n();
  const [currency, setCurrency] = useState<"USD" | "IDR" | "EUR">("USD");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("site-locale-currency");
      if (raw) setCurrency((JSON.parse(raw) as { currency: typeof currency }).currency);
    } catch {}
    const handler = (e: any) => setCurrency(e.detail.currency);
    window.addEventListener("prefs:locale-currency", handler);
    return () => window.removeEventListener("prefs:locale-currency", handler);
  }, []);
  return (
    <main className="max-w-6xl mx-auto px-4 py-14">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{dict.pricing.title}</h1>
        <p className="mt-2 text-muted">{dict.pricing.subtitle}</p>
      </header>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          { name: dict.pricing.starter, price: 0, desc: dict.pricing.starterDesc },
          { name: dict.pricing.team, price: 9, desc: dict.pricing.teamDesc },
          { name: dict.pricing.business, price: 19, desc: dict.pricing.businessDesc },
        ].map((p) => (
          <div key={p.name} className="rounded-xl border border-subtle p-6 bg-card">
            <div className="text-sm text-muted">{p.name}</div>
            <div className="mt-2 text-3xl font-semibold">{p.price === 0 ? "Free" : formatMoney(p.price, currency)}</div>
            <p className="mt-2 text-muted">{p.desc}</p>
            <ul className="mt-4 text-sm space-y-2">
              {dict.pricing.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href={`${appUrl}/signup`} className="btn btn-primary w-full text-center">{dict.pricing.startFree}</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
