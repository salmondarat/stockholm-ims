"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConsentStatus = "accepted" | "declined" | "custom";

type ConsentPrefs = {
  status: ConsentStatus;
  functional: true; // always on (required)
  analytics?: boolean;
  marketing?: boolean;
  personalization?: boolean;
  updatedAt: number; // epoch ms
};

const STORAGE_KEY = "cookie-consent:v1";

export default function CookieConsent({
  policyHref = "/privacy",
}: {
  policyHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  // Read persisted choice on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setOpen(true);
        return;
      }
      const data = JSON.parse(raw) as ConsentPrefs | null;
      if (!data) setOpen(true);
    } catch {
      setOpen(true);
    }
    const onOpen = () => {
      setExpanded(true);
      setOpen(true);
    };
    window.addEventListener("open-cookie-consent", onOpen as EventListener);
    return () => {
      window.removeEventListener(
        "open-cookie-consent",
        onOpen as EventListener,
      );
    };
  }, []);

  const persist = (prefs: ConsentPrefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
    try {
      const days = 365;
      document.cookie = `consent=${encodeURIComponent(prefs.status)}; Max-Age=${days * 24 * 60 * 60}; Path=/; SameSite=Lax`;
    } catch {}
    try {
      window.dispatchEvent(
        new CustomEvent("cookie-consent:changed", { detail: prefs }),
      );
    } catch {}
  };

  const acceptAll = () => {
    persist({
      status: "accepted",
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true,
      updatedAt: Date.now(),
    });
    setOpen(false);
  };
  const declineAll = () => {
    persist({
      status: "declined",
      functional: true,
      analytics: false,
      marketing: false,
      personalization: false,
      updatedAt: Date.now(),
    });
    setOpen(false);
  };
  const saveCustom = () => {
    persist({
      status: "custom",
      functional: true,
      analytics,
      marketing,
      personalization,
      updatedAt: Date.now(),
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] md:inset-x-auto md:right-6 md:left-auto">
      <div className="max-w-2xl rounded-2xl border border-subtle bg-card px-4 py-4 shadow-xl md:px-6">
        <div className="space-y-3 text-sm">
          <p>
            We use cookies to make Stockholm IMS work and to improve it over
            time. For more details, see our{" "}
            <Link href={policyHref} className="underline" prefetch={false}>
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-muted">
            Declining disables non‑essential cookies. We’ll store one cookie to
            remember your choice.
          </p>

          {expanded && (
            <div className="mt-2 rounded-xl border border-subtle p-3">
              <div className="font-medium mb-2">Cookie preferences</div>
              <label className="flex items-center gap-2 text-sm opacity-70">
                <input type="checkbox" checked readOnly />
                <span>
                  Functional: required for basic operation (always on)
                </span>
              </label>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>Analytics: usage statistics to improve features</span>
              </label>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span>Marketing: measure campaigns and basic attribution</span>
              </label>
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={personalization}
                  onChange={(e) => setPersonalization(e.target.checked)}
                />
                <span>
                  Personalization: remember preferences and content choices
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button className="btn btn-primary" onClick={acceptAll}>
              Accept
            </button>
            <button className="btn btn-outline" onClick={declineAll}>
              Decline
            </button>
            <button
              className="ml-auto text-xs underline opacity-80 hover:opacity-100"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide options" : "Customize"}
            </button>
            {expanded && (
              <button className="btn btn-outline text-sm" onClick={saveCustom}>
                Save preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
