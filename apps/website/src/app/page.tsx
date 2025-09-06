"use client";

import Image from "next/image";
import Link from "next/link";
import { Boxes, Barcode, Camera, Cloud, FileText, Shield } from "lucide-react";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import PricingStrip from "@/components/PricingStrip";
import ComparePlansTable from "@/components/ComparePlansTable";
import { Send, TrendingUp, PlaneTakeoff, Rocket, Crown } from "lucide-react";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const heroImage = process.env.NEXT_PUBLIC_HERO_IMAGE || "/app-mock.svg";

export default function Home() {
  const { dict } = useI18n();
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="chip text-[--foreground]/80">
              Modern inventory platform
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-4 text-muted text-lg">{dict.home.heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`${appUrl}/signup`} className="btn btn-cta btn-pill">
                {dict.home.ctaTry}
              </Link>
              <Link href={`${appUrl}/login`} className="btn btn-outline">
                {dict.home.ctaLogin}
              </Link>
              <Link href={`${appUrl}/app`} className="btn btn-outline">
                {dict.home.ctaOpen}
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">No credit card required.</p>
          </div>
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-subtle shadow-sm">
            <Image
              src={heroImage}
              alt="App screenshot"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Mobile app download */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[9/16] w-full max-w-xs md:max-w-sm mx-auto rounded-[2rem] overflow-hidden border border-subtle shadow-sm bg-black/5">
            <Image
              src="/app-mock.svg"
              alt="Mobile app mockup"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Get the app</h2>
            <p className="mt-2 text-muted">
              Track inventory on the go with our responsive dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <Link href="#" aria-label="Download on the App Store">
                <Image
                  src="/badges/app-store.svg"
                  alt="App Store badge"
                  width={135}
                  height={40}
                />
              </Link>
              <Link href="#" aria-label="Get it on Google Play">
                <Image
                  src="/badges/google-play.svg"
                  alt="Google Play badge"
                  width={135}
                  height={40}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile app download */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[9/16] w-full max-w-xs md:max-w-sm mx-auto rounded-[2rem] overflow-hidden border border-subtle shadow-sm bg-black/5">
            <Image
              src="/app-mock.svg"
              alt="Mobile app mockup"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Get the app</h2>
            <p className="mt-2 text-muted">
              Track inventory on the go with our responsive dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-80"
                >
                  <path d="M16.365 1.43a4.64 4.64 0 0 1-1.116 3.355c-.84.992-2.211 1.789-3.478 1.696a4.83 4.83 0 0 1 1.116-3.45c.729-.912 2.028-1.696 3.478-1.6zM21.5 17.66c-.6 1.48-1.33 2.952-2.358 4.272-1.006 1.296-2.215 2.736-3.81 2.76-1.642.024-2.17-.84-4.046-.84-1.852 0-2.45.816-4.07.864-1.643.024-2.89-1.4-3.9-2.696C.788 19.92-.186 16.18.31 12.86c.408-2.712 1.887-4.992 4.14-5.04 1.572-.048 2.862 1.008 3.81 1.008.948 0 2.606-1.248 4.41-1.056.749.072 2.862.288 4.21 2.208-3.456 1.848-2.91 6.696.61 7.68z" />
                </svg>
                <span className="text-sm">Download on the App Store</span>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="opacity-80"
                >
                  <path d="M325.3 234.3L104.9 18.5c-10.3-10.1-27.5-2.9-27.5 11.6v451.8c0 14.6 17.3 21.8 27.6 11.5l219.9-219.9c6.3-6.3 6.3-16.4 0-22.8zM371.6 88.3l-26.5 26.6 94.9 94.9c6.3 6.3 16.4 6.3 22.6.1l26.7-26.6c10.3-10.3 3-27.9-11.6-27.9h-79.5c-10 0-15-12.1-8.5-19.1l17.4-17.4c10.1-10 2.9-27.2-11.5-27.2h-24.5zM345.1 396.1l26.5 26.5c10.3 10.3 27.9 3 27.9-11.6v-79.5c0-14.6 12.1-15 19.2-8.5l17.4 17.4c10.1 10.1 27.3 2.9 27.3-11.6v-24.5c0-14.5-17.3-21.7-27.6-11.4l-94.9 94.9z" />
                </svg>
                <span className="text-sm">Get it on Google Play</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Logos / social proof */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-muted text-sm">
            {dict.home.trusted}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {[
              { name: "Stripe", src: "/logos/partners/stripe.svg" },
              { name: "Shopify", src: "/logos/partners/shopify.svg" },
              { name: "Cloudflare", src: "/logos/partners/cloudflare.svg" },
              { name: "GitHub", src: "/logos/partners/github.svg" },
              { name: "Next.js", src: "/logos/partners/nextjs.svg" },
              { name: "Vercel", src: "/logos/partners/vercel.svg" },
            ].map((logo) => (
              <div
                key={logo.name}
                className="logo-tile h-10 rounded border border-subtle bg-white flex items-center justify-center"
              >
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={120}
                  height={24}
                  className="h-6 w-auto opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
            <Image
              src="/mock-scan.svg"
              alt="Scanning barcode"
              fill
              className="object-cover"
            />
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

      {/* Use cases scroller */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">Use cases</h3>
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {[
                {
                  title: "Inventory Management",
                  desc: "In‑store stock and variants.",
                  href: "/solutions/inventory-management",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Supplies Tracking",
                  desc: "Consumables and materials.",
                  href: "/solutions/supplies",
                  img: "/mock-media.svg",
                },
                {
                  title: "Asset Tracking",
                  desc: "Devices, labels, locations.",
                  href: "/solutions/assets",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Construction",
                  desc: "Job sites & equipment.",
                  href: "/solutions/construction",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Electrical",
                  desc: "Supplies & tools.",
                  href: "/solutions/electrical",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Medical",
                  desc: "Supplies & equipment.",
                  href: "/solutions/medical",
                  img: "/mock-media.svg",
                },
                {
                  title: "Design",
                  desc: "Projects & materials.",
                  href: "/solutions/design",
                  img: "/mock-media.svg",
                },
                {
                  title: "Warehouse",
                  desc: "Receiving & picking.",
                  href: "/solutions/warehouse",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Education",
                  desc: "Classroom inventory.",
                  href: "/solutions/education",
                  img: "/mock-media.svg",
                },
                {
                  title: "Field Teams",
                  desc: "Kits & tools on the go.",
                  href: "/solutions/field",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Manufacturing",
                  desc: "Components & finished goods.",
                  href: "/solutions/manufacturing",
                  img: "/mock-generic.svg",
                },
                {
                  title: "Nonprofit",
                  desc: "Donations & event kits.",
                  href: "/solutions/nonprofit",
                  img: "/mock-media.svg",
                },
              ].map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="w-72 shrink-0 rounded-xl border border-subtle bg-card overflow-hidden"
                >
                  <div className="relative h-36 w-full">
                    <Image src={c.img} alt="" fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted">{c.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-semibold">{dict.home.mediaTitle}</h2>
            <p className="mt-2 text-muted">{dict.home.mediaBody}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/features" className="btn btn-outline">
                {dict.home.exploreFeatures}
              </Link>
              <Link href="/pricing" className="btn btn-primary">
                {dict.home.seePricing}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
            <Image
              src="/mock-media.svg"
              alt="Team collaboration"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold">{dict.home.startInMinutes}</h3>
          <p className="mt-2 text-muted">{dict.home.startInMinutesBody}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={`${appUrl}/signup`} className="btn btn-primary">
              {dict.features.ctaCreate}
            </Link>
            <Link href={`${appUrl}/login`} className="btn btn-outline">
              {dict.features.ctaLogin}
            </Link>
          </div>
        </div>
      </section>

      {/* Compare plans strip */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <PricingStrip />
        </div>
      </section>

      {/* Compact compare table on homepage */}
      <section className="py-8 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
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
                  {
                    label: "User licenses",
                    values: ["1", "2", "5", "8", "12+"],
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
                    label: "Purchase orders",
                    values: [false, false, true, true, true],
                  },
                ],
              },
              {
                title: "Integrations",
                rows: [
                  {
                    label: "API & Webhooks",
                    values: [false, false, true, true, true],
                  },
                  { label: "SSO", values: [false, false, false, true, true] },
                ],
              },
            ]}
          />
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
            <div
              key={x.v}
              className="rounded-xl border border-subtle bg-card p-6"
            >
              <div className="text-3xl font-semibold">{x.k}</div>
              <div className="text-sm text-muted mt-1">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">
            Why teams choose Stockholm IMS
          </h3>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                t: "Fast",
                d: "Instant navigation built on Next.js.",
                I: Boxes,
              },
              {
                t: "Accurate",
                d: "Variant‑level stock with SKU safety.",
                I: Barcode,
              },
              {
                t: "Portable",
                d: "Scan with your phone — no hardware.",
                I: Camera,
              },
              { t: "Flexible", d: "Local uploads or S3/MinIO.", I: Cloud },
              {
                t: "Exportable",
                d: "Clean PDF exports any time.",
                I: FileText,
              },
              { t: "Secure", d: "Modern auth and best practices.", I: Shield },
            ].map(({ t, d, I }) => (
              <div
                key={t}
                className="rounded-xl border border-subtle bg-card p-5"
              >
                <div className="flex items-center gap-2">
                  <I className="h-4 w-4 text-[--primary]" />
                  <div className="font-medium">{t}</div>
                </div>
                <div className="text-sm text-muted mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials carousel */}
      <section className="py-16 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-center">
            Loved by practical teams
          </h3>
          <div className="mt-8">
            <TestimonialCarousel />
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
              <div
                key={f.q}
                className="rounded-xl border border-subtle bg-card p-5"
              >
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
