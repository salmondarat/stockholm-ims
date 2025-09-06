"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMoney } from "@/components/LocaleCurrencyPicker";
import useI18n from "@/hooks/useI18n";
import ComparePlansTable from "@/components/ComparePlansTable";
import { Send, TrendingUp, PlaneTakeoff, Rocket, Crown } from "lucide-react";

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
      if (raw)
        setCurrency(
          (JSON.parse(raw) as { currency: typeof currency }).currency,
        );
    } catch {}
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ currency?: "USD" | "IDR" | "EUR" }>)
        .detail;
      if (detail && detail.currency) setCurrency(detail.currency);
    };
    window.addEventListener("prefs:locale-currency", handler as EventListener);
    return () =>
      window.removeEventListener(
        "prefs:locale-currency",
        handler as EventListener,
      );
  }, []);
  // Sync billing with querystring
  useEffect(() => {
    const mode = (search?.get("billing") || "monthly").toLowerCase();
    setAnnual(mode === "annual");
  }, [search]);

  const plans = useMemo(
    () => [
      {
        key: "free",
        name: "Free",
        monthly: 0,
        desc: "Best for getting started.",
        cta: "Sign Up",
        highlights: ["100 Unique Items", "1 User License"],
      },
      {
        key: "advanced",
        name: "Advanced",
        monthly: 49,
        desc: "Best for maintaining optimal inventory levels.",
        cta: "Start Free Trial",
        highlights: [
          "500 Unique Items",
          "2 User Licenses",
          "+ Unlimited QR Code Label Creation",
        ],
      },
      {
        key: "ultra",
        name: "Ultra",
        monthly: 149,
        desc: "Best for simplifying day-to-day inventory tasks.",
        cta: "Start Free Trial",
        popular: true,
        highlights: [
          "2,000 Unique Items",
          "5 User Licenses",
          "+ Unlimited QR Code & Barcode Label Creation",
          "+ Purchase Orders",
        ],
      },
      {
        key: "premium",
        name: "Premium",
        monthly: 299,
        desc: "Best for streamlining processes and oversight.",
        cta: "Start Free Trial",
        highlights: [
          "5,000 Unique Items",
          "8 User Licenses",
          "+ Customizable Role Permissions",
          "+ QuickBooks Online Integration",
        ],
      },
      {
        key: "enterprise",
        name: "Enterprise",
        monthly: undefined,
        desc: "Best for customized processes and control.",
        cta: "Talk to Sales",
        quote: true as const,
        highlights: [
          "10,000+ Unique Items",
          "12+ User Licenses",
          "+ API and Webhooks",
          "+ Dedicated Customer Success Manager",
        ],
      },
    ],
    [],
  );

  const displayPlans = useMemo(() => {
    return plans.map((p) => {
      if (p.quote) return { ...p, price: undefined };
      if ((p.monthly ?? 0) === 0) return { ...p, price: 0 };
      if (annual && typeof p.monthly === "number")
        return { ...p, price: Math.round(p.monthly * 0.8 * 100) / 100 };
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 max-w-[320px] rounded-md border border-subtle bg-card text-xs text-[--foreground] p-2 shadow">
                Annual billing applies ~20% discount. Price shown is per user
                per month, billed yearly.
              </div>
            )}
            <span className={!annual ? "font-medium" : "text-muted"}>
              Monthly
            </span>
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
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${annual ? "translate-x-4" : "translate-x-1"}`}
              />
            </button>
            <span className={annual ? "font-medium" : "text-muted"}>
              Annual
            </span>
          </div>
        </div>
      </header>

      <div
        className="mt-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
        id="plans"
      >
        {displayPlans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-xl border p-6 bg-card flex flex-col ${p.popular ? "border-[--primary] shadow-[0_0_0_3px_rgba(239,68,68,0.12)] scale-[1.02]" : "border-subtle"}`}
          >
            {p.popular && (
              <div className="absolute -top-4 left-6 right-6 rounded-md bg-red-500 text-white text-xs text-center py-1 font-medium shadow">
                Most Popular
              </div>
            )}
            {/* Title */}
            <div className="text-lg font-semibold min-h-[28px]">{p.name}</div>
            {/* Description */}
            <p className="mt-1 text-sm text-muted min-h-[64px]">{p.desc}</p>
            {/* Price row */}
            <div className="mt-3 min-h-[48px] flex items-end gap-1">
              <div className="text-3xl font-bold leading-none">
                {typeof p.price === "number"
                  ? p.price === 0
                    ? "$0"
                    : formatMoney(p.price, currency)
                  : "Get a Quote"}
              </div>
              {typeof p.price === "number" && p.price > 0 && (
                <span className="text-base font-normal text-muted">/mo.</span>
              )}
            </div>
            {/* Savings hint (fixed height) */}
            <div className="mt-1 h-[20px] text-xs">
              {typeof p.monthly === "number" && p.monthly > 0 ? (
                <button
                  className="underline text-red-600 whitespace-nowrap overflow-hidden text-ellipsis"
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(search?.toString());
                    const next = annual ? "monthly" : "annual";
                    params.set("billing", next);
                    router.replace(`?${params.toString()}`);
                  }}
                >
                  switch to yearly to save ~20%
                </button>
              ) : null}
            </div>
            {/* CTA (fixed height) */}
            <div className="mt-4 h-[40px]">
              <Link
                href={p.quote ? "/contact" : `${appUrl}/signup`}
                className={`btn w-full h-full text-center ${p.quote ? "btn-outline" : "btn-primary"}`}
              >
                {p.cta}
              </Link>
            </div>
            <hr className="my-5 border-subtle" />
            {/* Features start aligned */}
            <ul className="text-sm space-y-2 flex-1">
              {p.highlights?.map((h: string) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Compare Plans table */}
      <ComparePlansTable
        plans={[
          { name: "Free", icon: <Send className="h-4 w-4" /> },
          { name: "Advanced", icon: <TrendingUp className="h-4 w-4" /> },
          { name: "Ultra", icon: <PlaneTakeoff className="h-4 w-4" /> },
          { name: "Premium", icon: <Rocket className="h-4 w-4" /> },
          { name: "Enterprise", icon: <Crown className="h-4 w-4" /> },
        ]}
        sections={[
          {
            title: "Organize",
            rows: [
              {
                label: "Unique items",
                values: ["100", "500", "2,000", "5,000", "10,000+"],
              },
              { label: "User licenses", values: ["1", "2", "5", "8", "12+"] },
              {
                label: "Inventory import (CSV)",
                values: [true, true, true, true, true],
              },
              { label: "Item photos", values: [true, true, true, true, true] },
              {
                label: "Tags & categories",
                values: [true, true, true, true, true],
              },
            ],
          },
          {
            title: "Customize",
            rows: [
              {
                label: "Custom fields",
                values: ["1", "5", "10", "20", "Unlimited"],
              },
              {
                label: "Variants / options",
                values: [true, true, true, true, true],
              },
              {
                label: "Custom role permissions",
                values: [false, false, true, true, true],
              },
              {
                label: "Multi-location support",
                values: [false, false, true, true, true],
              },
            ],
          },
          {
            title: "Manage",
            rows: [
              {
                label: "Barcode & QR scanning",
                values: [true, true, true, true, true],
              },
              {
                label: "Barcode label PDFs",
                values: [true, true, true, true, true],
              },
              {
                label: "Item check-in / check-out",
                values: [true, true, true, true, true],
              },
              {
                label: "Purchase orders",
                values: [false, false, true, true, true],
              },
              { label: "Pick lists", values: [false, false, true, true, true] },
            ],
          },
          {
            title: "Track & Update",
            rows: [
              {
                label: "Low stock alerts",
                values: [false, true, true, true, true],
              },
              {
                label: "Date-based alerts",
                values: [false, false, true, true, true],
              },
              {
                label: "Offline mode",
                values: [false, true, true, true, true],
              },
              {
                label: "Automatic sync",
                values: [true, true, true, true, true],
              },
              {
                label: "Email alerts",
                values: [false, true, true, true, true],
              },
            ],
          },
          {
            title: "Reports",
            rows: [
              {
                label: "Activity history",
                values: [
                  "1 month",
                  "1 year",
                  "3 years",
                  "Unlimited",
                  "Unlimited",
                ],
              },
              {
                label: "Summary reports",
                values: [false, true, true, true, true],
              },
              {
                label: "Low stock reports",
                values: [true, true, true, true, true],
              },
              {
                label: "Saved reports",
                values: [false, false, true, true, true],
              },
            ],
          },
          {
            title: "Integrations",
            rows: [
              { label: "Webhooks", values: [false, false, true, true, true] },
              { label: "API", values: [false, false, true, true, true] },
              { label: "SSO", values: [false, false, false, true, true] },
            ],
          },
          {
            title: "Support",
            rows: [
              {
                label: "Help center resources",
                values: [true, true, true, true, true],
              },
              {
                label: "Email support",
                values: [true, true, true, true, true],
              },
              {
                label: "Priority support",
                values: [false, true, true, true, true],
              },
              {
                label: "Onboarding session",
                values: [false, false, true, true, true],
              },
              {
                label: "Dedicated success manager",
                values: [false, false, false, false, true],
              },
            ],
          },
        ]}
      />
    </main>
  );
}
