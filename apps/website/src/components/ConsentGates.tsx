"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cookie-consent:v1";

function readPref<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
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
      const prefs = readPref<{ analytics?: boolean; marketing?: boolean }>() || {};
      const gaId = process.env.NEXT_PUBLIC_GA_ID;
      const fbId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

      if (prefs.analytics && gaId) {
        try {
          await loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`);
          // GA init
          (window as any).dataLayer = (window as any).dataLayer || [];
          function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
          (window as any).gtag = gtag;
          gtag('js', new Date());
          gtag('config', gaId);
        } catch {}
      }

      if (prefs.marketing && fbId) {
        try {
          await loadScript('https://connect.facebook.net/en_US/fbevents.js');
          (window as any).fbq = (window as any).fbq || function(){ (window as any).fbq.callMethod ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments) : (window as any).fbq.queue.push(arguments) };
          if (!(window as any).fbq.queue) (window as any).fbq.queue = [];
          (window as any).fbq('init', fbId);
          (window as any).fbq('track', 'PageView');
        } catch {}
      }
    };
    apply();

    const onChange = () => apply();
    window.addEventListener('cookie-consent:changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('cookie-consent:changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return null;
}

