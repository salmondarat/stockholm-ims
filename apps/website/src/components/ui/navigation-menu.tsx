"use client";

"use client";

import Link from "next/link";
import * as Nav from "@radix-ui/react-navigation-menu";
import { Smartphone, Barcode, QrCode, Plug, Bell, BarChart3, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import useI18n from "@/hooks/useI18n";

export default function NavigationMenu() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { dict } = useI18n();
  return (
    <Nav.Root className="z-50 contents">
      <Nav.List className="flex items-center gap-1">
        {/* Features */}
        <Nav.Item>
          <Nav.Trigger className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 data-[state=open]:text-[--brand] inline-flex items-center gap-1">
            {dict.features.title} <ChevronDown className="h-3.5 w-3.5" />
          </Nav.Trigger>
          <Nav.Content className="absolute left-0 right-0 top-full mt-0 rounded-2xl border bg-white text-gray-900 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-[280px_1fr_1fr_1fr] gap-8">
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-500">Overview</div>
                <div className="mt-2 text-2xl font-semibold">{dict.features.title} <span className="inline-block">→</span></div>
                <p className="mt-2 text-sm text-gray-600">{dict.features.subtitle}</p>
                <Link href="/features" className="mt-4 inline-flex items-center gap-1 text-[--brand]">{dict.home.exploreFeatures} →</Link>
              </div>

              <div className="space-y-4">
                <MegaItem icon={<Smartphone className="h-5 w-5" />} title="Mobile App" desc="Track inventory from any device with our responsive dashboard." href="/features#mobile" />
                <MegaItem icon={<Barcode className="h-5 w-5" />} title="Barcoding" desc={dict.features.barcodeBody} href="/features#barcoding" />
              </div>
              <div className="space-y-4">
                <MegaItem icon={<QrCode className="h-5 w-5" />} title="QR Coding" desc={dict.features.barcodeBody} href="/features#qr" />
                <MegaItem icon={<Plug className="h-5 w-5" />} title="Integrations" desc="Connect via exports and flexible storage options." href="/features#integrations" />
              </div>
              <div className="space-y-4">
                <MegaItem icon={<Bell className="h-5 w-5" />} title="Alerts" desc="Low‑stock thresholds and status at a glance." href="/features#alerts" />
                <MegaItem icon={<BarChart3 className="h-5 w-5" />} title="Reporting" desc="Generate clean, data‑driven PDF exports." href="/features#reporting" />
              </div>
            </div>
          </Nav.Content>
        </Nav.Item>

        {/* Solutions */}
        <Nav.Item>
          <Nav.Trigger className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 data-[state=open]:text-[--brand] inline-flex items-center gap-1">
            {dict?.solutions?.title ?? "Solutions"} <ChevronDown className="h-3.5 w-3.5" />
          </Nav.Trigger>
          <Nav.Content className="absolute left-0 right-0 top-full mt-0 rounded-2xl border bg-white text-gray-900 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-6">
              <SolutionItem title={dict?.solutions?.retail ?? "Retail"} desc={dict?.solutions?.retailDesc ?? "In‑store stock and variants."} />
              <SolutionItem title={dict?.solutions?.ecom ?? "E‑commerce"} desc={dict?.solutions?.ecomDesc ?? "Catalog management and SKUs."} />
              <SolutionItem title={dict?.solutions?.it ?? "IT Assets"} desc={dict?.solutions?.itDesc ?? "Devices, labels, and locations."} />
              <SolutionItem title={dict?.solutions?.mfg ?? "Manufacturing"} desc={dict?.solutions?.mfgDesc ?? "Components and finished goods."} />
              <SolutionItem title={dict?.solutions?.field ?? "Field Teams"} desc={dict?.solutions?.fieldDesc ?? "Track kits on the go."} />
              <NavLink href={`${appUrl}/app`} title={dict?.solutions?.openDashboard ?? "Open Dashboard"} desc={dict?.solutions?.openDesc ?? "Try the app now"} />
            </div>
          </Nav.Content>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/pricing" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100">{dict.pricing.title}</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/about" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100">{dict?.nav?.about ?? 'About'}</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/contact" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100">{dict?.nav?.contact ?? 'Contact'}</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Indicator className="data-[state=visible]:animate-in data-[state=hidden]:animate-out" />
      </Nav.List>
      <Nav.Viewport className="absolute left-0 right-0 top-full w-full" />
    </Nav.Root>
  );
}

function NavLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block rounded-md p-3 hover:bg-gray-50">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-600">{desc}</div>
    </Link>
  );
}

function MegaItem({ icon, title, desc, href }: { icon: ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="flex gap-3 rounded-md p-3 hover:bg-gray-50">
      <div className="mt-0.5 text-[--brand]">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </Link>
  );
}

function SolutionItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md p-3 hover:bg-gray-50">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-600">{desc}</div>
    </div>
  );
}
