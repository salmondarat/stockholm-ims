"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Plan = {
  name: string;
  monthly?: number; // USD
  note: string;
  cta: string;
  ctaHref?: string;
  badge?: { label: string; color: "success" | "primary" | "brand" };
  popular?: boolean;
  quote?: boolean; // Enterprise-style pricing
};

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    note: "Best for getting started.",
    cta: "Sign Up",
    ctaHref: "/pricing",
    badge: { label: "Free", color: "success" },
  },
  {
    name: "Advanced",
    monthly: 49,
    note: "Maintain optimal inventory levels.",
    cta: "Start Free Trial",
    ctaHref: "/pricing",
  },
  {
    name: "Ultra",
    monthly: 149,
    note: "Simplify day‑to‑day inventory.",
    cta: "Start Free Trial",
    ctaHref: "/pricing",
    badge: { label: "Most Popular", color: "primary" },
    popular: true,
  },
  {
    name: "Premium",
    monthly: 299,
    note: "Streamline processes and oversight.",
    cta: "Start Free Trial",
    ctaHref: "/pricing",
  },
  {
    name: "Enterprise",
    note: "Customized processes and control.",
    cta: "Talk to Sales",
    ctaHref: "/pricing",
    quote: true,
  },
];

export default function PricingStrip() {
  const [annual, setAnnual] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const priced = useMemo(() => {
    return PLANS.map((p) => {
      if (p.quote) return { ...p, priceText: "Get a Quote" };
      if ((p.monthly ?? 0) === 0) return { ...p, priceText: "$0" };
      // Annual stub: ~20% off, billed yearly
      if (annual && typeof p.monthly === "number") {
        const perMonth = Math.round(p.monthly * 0.8 * 100) / 100;
        return { ...p, priceText: `$${perMonth}` };
      }
      return { ...p, priceText: `$${p.monthly}` };
    });
  }, [annual]);

  return (
    <div className="rounded-2xl border border-subtle bg-card p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="text-sm text-muted">Simple, transparent pricing</div>
        <div className="relative inline-flex items-center gap-2 text-sm whitespace-nowrap">
          {/* Left overlay: discount + info (does not affect centering) */}
          <span className="absolute right-full pr-2 inline-flex items-center gap-1">
            <span
              className={`badge badge-success ${annual ? "" : "invisible"}`}
            >
              Save ~20%
            </span>
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
            <div className="absolute bottom-full right-0 mb-2 z-20 max-w-[260px] rounded-md border border-subtle bg-card text-xs text-[--foreground] p-2 shadow">
              Annual billing applies ~20% discount. Price shown is per user per
              month, billed yearly.
            </div>
          )}
          <span className={!annual ? "font-medium" : "text-muted"}>
            Monthly
          </span>
          <button
            type="button"
            className={`relative inline-flex h-6 w-10 items-center rounded-full border transition-colors ${annual ? "bg-[--primary] border-transparent" : "bg-gray-200"}`}
            aria-pressed={annual}
            onClick={() => setAnnual((v) => !v)}
            title="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${annual ? "translate-x-4" : "translate-x-1"}`}
            />
          </button>
          <span className={annual ? "font-medium" : "text-muted"}>Annual</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
        {priced.map((p) => (
          <div
            key={p.name}
            className={`flex-1 rounded-xl border p-4 relative transition-transform will-change-transform ${p.popular ? "border-[--primary] shadow-[0_0_0_3px_rgba(99,102,241,0.12)] scale-[1.03] z-[1] hover:scale-[1.06] hover:shadow-xl" : "border-subtle hover:shadow-md hover:scale-[1.02]"}`}
            title={`${p.name} — ${p.note}${annual && p.monthly ? " (annual)" : ""}`}
          >
            {p.popular && (
              <div className="absolute -top-5 left-0 right-0">
                <div className="mx-4 rounded-md bg-[--primary] text-[--primary-foreground] text-xs py-1 text-center">
                  Most popular
                </div>
              </div>
            )}
            {p.badge && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <span
                  className={`badge ${p.badge.color === "success" ? "badge-success" : p.badge.color === "brand" ? "badge-brand" : "badge-primary"}`}
                >
                  {p.badge.label}
                </span>
              </div>
            )}
            <div className="text-sm text-muted">{p.name}</div>
            <div className="mt-1 text-2xl font-semibold">{p.priceText}</div>
            <div className="text-sm text-muted">
              {annual && p.monthly ? "Per user / mo (billed yearly)" : p.note}
            </div>
            <Link
              href={p.ctaHref || "/pricing"}
              className="mt-3 inline-flex btn btn-outline"
              title={`Open pricing details for ${p.name}`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link href="/pricing" className="btn btn-primary btn-pill">
          Compare full plans
        </Link>
      </div>
    </div>
  );
}
