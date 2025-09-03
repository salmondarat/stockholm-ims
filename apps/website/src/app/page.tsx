"use client";

import Image from "next/image";
import Link from "next/link";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function Home() {
  const { dict } = useI18n();
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[--background] to-[#0b1b34]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{dict.home.heroTitle}</h1>
            <p className="mt-4 text-muted text-lg">{dict.home.heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`${appUrl}/signup`} className="btn btn-primary">{dict.home.ctaTry}</Link>
              <Link href={`${appUrl}/login`} className="btn btn-outline">{dict.home.ctaLogin}</Link>
              <Link href={`${appUrl}/app`} className="btn btn-outline">{dict.home.ctaOpen}</Link>
            </div>
            <p className="mt-3 text-xs text-muted">No credit card required.</p>
          </div>
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-subtle shadow-sm">
            <Image src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop" alt="Warehouse shelves" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      {/* Logos / social proof */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-muted text-sm">{dict.home.trusted}</div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-70">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-white/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
            <Image src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop" alt="Scanning barcode" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{dict.home.scanTitle}</h2>
            <p className="mt-2 text-muted">{dict.home.scanBody}</p>
            <ul className="mt-4 space-y-2 text-sm text-[--foreground] list-disc pl-5">
              <li>Built‑in camera scanning (no hardware required)</li>
              <li>Variant SKUs and quantities</li>
              <li>Low‑stock alerts</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-semibold">{dict.home.mediaTitle}</h2>
            <p className="mt-2 text-muted">{dict.home.mediaBody}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/features" className="btn btn-outline">{dict.home.exploreFeatures}</Link>
              <Link href="/pricing" className="btn btn-primary">{dict.home.seePricing}</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
            <Image src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=1200&auto=format&fit=crop" alt="Team collaboration" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold">{dict.home.startInMinutes}</h3>
          <p className="mt-2 text-muted">{dict.home.startInMinutesBody}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={`${appUrl}/signup`} className="btn btn-primary">{dict.features.ctaCreate}</Link>
            <Link href={`${appUrl}/login`} className="btn btn-outline">{dict.features.ctaLogin}</Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { k: "2k+", v: "Items tracked" },
            { k: "98%", v: "Inventory accuracy" },
            { k: "<5m", v: "To first import" },
            { k: "99.9%", v: "Uptime" },
          ].map((x) => (
            <div key={x.v} className="rounded-xl border border-subtle bg-card p-6">
              <div className="text-3xl font-semibold">{x.k}</div>
              <div className="text-sm text-muted mt-1">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">Why teams choose Stockholm IMS</h3>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { t: "Fast", d: "Built with Next.js App Router for instant navigation." },
              { t: "Accurate", d: "Variant‑level stock with duplicate SKU protection." },
              { t: "Portable", d: "Scan with your phone — no extra hardware." },
              { t: "Flexible", d: "Upload locally or use S3/MinIO for storage." },
              { t: "Exportable", d: "Generate clean PDF exports for reports or catalogs." },
              { t: "Secure", d: "User auth with modern best practices." },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border border-subtle bg-card p-5">
                <div className="font-medium">{f.t}</div>
                <div className="text-sm text-muted mt-1">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">Loved by practical teams</h3>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { q: "We replaced spreadsheets in a week.", a: "Ops Lead, Retail" },
              { q: "Barcode scanning on phones is a game‑changer.", a: "Warehouse Manager" },
              { q: "The variant system fits our catalog perfectly.", a: "E‑commerce Director" },
            ].map((t) => (
              <div key={t.q} className="rounded-xl border border-subtle bg-card p-5">
                <p>“{t.q}”</p>
                <div className="text-sm text-muted mt-2">— {t.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">FAQ</h3>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "Can I import existing data?",
                a: "Yes. Upload a CSV or use our API to seed items, variants, and tags.",
              },
              {
                q: "Does it work on mobile?",
                a: "Absolutely — the dashboard is responsive and supports camera scanning.",
              },
              {
                q: "Where are files stored?",
                a: "Choose local storage or configure S3/MinIO in settings.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-xl border border-subtle bg-card p-5">
                <div className="font-medium">{f.q}</div>
                <div className="text-sm text-muted mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
