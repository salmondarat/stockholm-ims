"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMoney } from "@/components/LocaleCurrencyPicker";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function PricingPage() {
  const { dict } = useI18n();
  const [currency, setCurrency] = useState<"USD" | "IDR" | "EUR">("USD");
  const search = useSearchParams();
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [showTip, setShowTip] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("site-locale-currency");
      if (raw) setCurrency((JSON.parse(raw) as { currency: typeof currency }).currency);
    } catch {}
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ currency?: "USD" | "IDR" | "EUR" }>).detail;
      if (detail && detail.currency) setCurrency(detail.currency);
    };
    window.addEventListener("prefs:locale-currency", handler as EventListener);
    return () => window.removeEventListener("prefs:locale-currency", handler as EventListener);
  }, []);
  // Sync billing with querystring
  useEffect(() => {
    const mode = (search?.get("billing") || "monthly").toLowerCase();
    setAnnual(mode === "annual");
  }, [search]);

  const plans = useMemo(
    () => [
      { name: dict.pricing.starter, monthly: 0, desc: dict.pricing.starterDesc },
      { name: dict.pricing.team, monthly: 9, desc: dict.pricing.teamDesc, popular: true },
      { name: dict.pricing.business, monthly: 19, desc: dict.pricing.businessDesc },
    ],
    [dict]
  );

  const displayPlans = useMemo(() => {
    return plans.map((p) => {
      if (p.monthly === 0) return { ...p, price: 0 };
      if (annual) return { ...p, price: Math.round(p.monthly * 0.8 * 100) / 100 };
      return { ...p, price: p.monthly };
    });
  }, [plans, annual]);
  return (
    <main className="max-w-6xl mx-auto px-4 py-14">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{dict.pricing.title}</h1>
        <p className="mt-2 text-muted">{dict.pricing.subtitle}</p>
        <div className="mt-4 relative flex justify-center w-full">
          <div className="relative inline-flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="absolute right-full pr-2 inline-flex items-center gap-1">
              <span className={`badge badge-success ${annual ? "" : "invisible"}`}>Save ~20%</span>
              <button
                type="button"
                className="h-5 w-5 grid place-items-center rounded-full border border-subtle text-[10px] text-muted bg-white hover:bg-gray-100"
                aria-label="Annual billing info"
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                onFocus={() => setShowTip(true)}
                onBlur={() => setShowTip(false)}
              >
                i
              </button>
            </span>
            {showTip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 max-w-[320px] rounded-md border border-subtle bg-card text-xs text-[--foreground] p-2 shadow">
                Annual billing applies ~20% discount. Price shown is per user per month, billed yearly.
              </div>
            )}
            <span className={!annual ? "font-medium" : "text-muted"}>Monthly</span>
            <button
              type="button"
              className={`relative inline-flex h-6 w-10 items-center rounded-full border transition-colors ${annual ? "bg-[--primary] border-transparent" : "bg-gray-200"}`}
              aria-pressed={annual}
              onClick={() => {
                const next = annual ? "monthly" : "annual";
                const params = new URLSearchParams(search?.toString());
                params.set("billing", next);
                router.replace(`?${params.toString()}`);
              }}
              title="Toggle annual billing"
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${annual ? "translate-x-4" : "translate-x-1"}`} />
            </button>
            <span className={annual ? "font-medium" : "text-muted"}>Annual</span>
          </div>
        </div>
      </header>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {displayPlans.map((p) => (
          <div key={p.name} className={`rounded-xl border p-6 bg-card ${p.popular ? 'border-[--primary] shadow-[0_0_0_3px_rgba(99,102,241,0.12)] scale-[1.02]' : 'border-subtle'}`}>
            <div className="text-sm text-muted">{p.name}</div>
            <div className="mt-2 text-3xl font-semibold">{p.price === 0 ? "Free" : formatMoney(p.price, currency)}</div>
            <p className="mt-2 text-muted">{annual && p.monthly ? 'Per user / mo (billed yearly)' : p.desc}</p>
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
