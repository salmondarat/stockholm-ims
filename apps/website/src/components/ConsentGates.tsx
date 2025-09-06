"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cookie-consent:v1";

type ConsentPrefs = { analytics?: boolean; marketing?: boolean };

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFn;
  }
}

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
};

function readPref<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function loadScript(
  src: string,
  attrs: Record<string, string> = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src=\"${src}\"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function ConsentGates() {
  useEffect(() => {
    const apply = async () => {
      const prefs = readPref<ConsentPrefs>() || {};
      const gaId = process.env.NEXT_PUBLIC_GA_ID;
      const fbId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

      if (prefs.analytics && gaId) {
        try {
          await loadScript(
            `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
          );
          // GA init (typed)
          window.dataLayer = window.dataLayer || [];
          const gtag = (...args: unknown[]) => {
            window.dataLayer.push(args);
          };
          window.gtag = gtag;
          gtag("js", new Date());
          gtag("config", gaId);
        } catch {}
      }

      if (prefs.marketing && fbId) {
        try {
          await loadScript("https://connect.facebook.net/en_US/fbevents.js");
          if (!window.fbq) {
            const fbq: FbqFn = (...args: unknown[]) => {
              if (typeof fbq.callMethod === "function") {
                fbq.callMethod(...args);
              } else {
                fbq.queue = fbq.queue ?? [];
                fbq.queue.push(args);
              }
            };
            window.fbq = fbq;
          }
          if (!window.fbq.queue) window.fbq.queue = [];
          window.fbq("init", fbId);
          window.fbq("track", "PageView");
        } catch {}
      }
    };
    apply();

    const onChange = () => apply();
    window.addEventListener("cookie-consent:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cookie-consent:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return null;
}
