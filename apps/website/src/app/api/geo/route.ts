import { NextRequest, NextResponse } from "next/server";

const EU = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]);

function mapCountryTo({ country }: { country?: string | null }) {
  const cc = (country || "").toUpperCase();
  const lang = cc === "ID" ? "id" : "en";
  const currency = cc === "ID" ? "IDR" : EU.has(cc) ? "EUR" : "USD";
  return { country: cc || null, lang, currency };
}

async function fetchExternal(): Promise<{ country?: string | null }> {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 1500);
    const res = await fetch("https://ipapi.co/json/", { signal: ac.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { country?: string };
    return { country: j.country || null };
  } catch {
    return { country: null };
  }
}

export async function GET(req: NextRequest) {
  // Try common edge headers first
  const hdr = (name: string) => req.headers.get(name) || undefined;
  const country =
    hdr("x-vercel-ip-country") ||
    hdr("x-country-code") ||
    hdr("cf-ipcountry") ||
    hdr("x-appengine-country") ||
    null;

  if (country) return NextResponse.json(mapCountryTo({ country }));

  const ext = await fetchExternal();
  return NextResponse.json(mapCountryTo(ext));
}

