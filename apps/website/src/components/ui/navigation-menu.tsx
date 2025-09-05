"use client";

import Link from "next/link";
import * as Nav from "@radix-ui/react-navigation-menu";
import {
  Smartphone,
  Barcode,
  QrCode,
  Plug,
  Bell,
  BarChart3,
  ChevronDown,
  Store,
  ShoppingCart,
  Laptop,
  Factory,
  Users,
  LayoutDashboard,
  Boxes,
  Package,
  Wrench,
  Activity,
  GraduationCap,
  Building2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import useI18n from "@/hooks/useI18n";

export default function NavigationMenu() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { dict } = useI18n();
  const [showIndustriesMore, setShowIndustriesMore] = useState(false);
  return (
    <Nav.Root className="z-50 contents">
      <Nav.List className="flex items-center gap-1">
        {/* Features */}
        <Nav.Item>
          <Nav.Trigger className="group px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 hover:text-[--primary] data-[state=open]:text-[--primary] inline-flex items-center gap-1 transition-colors">
            {dict.features.title}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-180 group-data-[state=open]:rotate-180"
            />
          </Nav.Trigger>
          <Nav.Content className="absolute left-0 right-0 top-full mt-0 rounded-2xl border bg-white text-gray-900 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-[280px_1fr_1fr_1fr] gap-8">
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-500">Overview</div>
                <div className="mt-2 text-2xl font-semibold">{dict.features.title} <span className="inline-block">→</span></div>
                <p className="mt-2 text-sm text-gray-600">{dict.features.subtitle}</p>
                {/* Removed "Explore features" link per request */}
              </div>

              <div className="space-y-4">
                <MegaItem icon={<Smartphone className="icon" />} title="Mobile App" desc="Track inventory from any device with our responsive dashboard." href="/features/mobile" />
                <MegaItem icon={<Barcode className="icon" />} title="Barcoding" desc={dict.features.barcodeBody} href="/features/barcoding" />
              </div>
              <div className="space-y-4">
                <MegaItem icon={<QrCode className="icon" />} title="QR Coding" desc={dict.features.barcodeBody} href="/features/qr" />
                <MegaItem icon={<Plug className="icon" />} title="Integrations" desc="Connect via exports and flexible storage options." href="/features/integrations" />
              </div>
              <div className="space-y-4">
                <MegaItem icon={<Bell className="icon" />} title="Alerts" desc="Low‑stock thresholds and status at a glance." href="/features/alerts" />
                <MegaItem icon={<BarChart3 className="icon" />} title="Reporting" desc="Generate clean, data‑driven PDF exports." href="/features/reporting" />
              </div>
            </div>
          </Nav.Content>
        </Nav.Item>

        {/* Solutions (overview + Use Cases + Industries) */}
        <Nav.Item>
          <Nav.Trigger className="group px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 hover:text-[--primary] data-[state=open]:text-[--primary] inline-flex items-center gap-1 transition-colors">
            {dict?.solutions?.title ?? "Solutions"}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-180 group-data-[state=open]:rotate-180"
            />
          </Nav.Trigger>
          <Nav.Content className="absolute left-0 right-0 top-full mt-0 rounded-2xl border bg-white text-gray-900 shadow-2xl">
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-[280px_1fr_1fr] gap-8">
              {/* Overview */}
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-500">{dict?.solutions?.title ?? "Solutions"}</div>
                <div className="mt-2 text-2xl font-semibold">
                  {dict?.solutions?.title ?? "Solutions"} <span className="inline-block">→</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {dict?.solutions?.subtitle ?? "No matter what you need to track, Stockholm has you covered."}
                </p>
              </div>

              {/* Use Cases */}
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Use cases</div>
                <SolutionItem icon={<LayoutDashboard className="icon" />} title="Inventory Management" desc="Organize items, variants, and counts with ease." href="/solutions/inventory-management" />
                <SolutionItem icon={<Package className="icon" />} title="Supplies Tracking" desc="Track supplies, materials, and parts across teams." href="/solutions/supplies" />
                <SolutionItem icon={<Wrench className="icon" />} title="Asset Tracking" desc="Manage tools, equipment, and high‑value assets." href="/solutions/assets" />
              </div>

              {/* Industries */}
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Industries</div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Keep original order to preserve positions */}
                  <SolutionItem icon={<Factory className="icon" />} title="Construction" desc="Manage inventory across all job sites." href="/solutions/construction" />
                  <div className={!showIndustriesMore ? "invisible pointer-events-none select-none" : "contents"}>
                    <SolutionItem icon={<Plug className="icon" />} title="Electrical" desc="Track electrical supplies and tools for every job." href="/solutions/electrical" />
                  </div>
                  <SolutionItem icon={<Activity className="icon" />} title="Medical" desc="Manage medical supplies & equipment on‑the‑go." href="/solutions/medical" />
                  <div className={!showIndustriesMore ? "invisible pointer-events-none select-none" : "contents"}>
                    <SolutionItem icon={<LayoutDashboard className="icon" />} title="Interior Design" desc="Visually track inventory across locations." href="/solutions/design" />
                  </div>
                  <SolutionItem icon={<Boxes className="icon" />} title="Warehouse" desc="Streamline warehouse operations with clarity." href="/solutions/warehouse" />
                  <div className={!showIndustriesMore ? "invisible pointer-events-none select-none" : "contents"}>
                    <SolutionItem icon={<GraduationCap className="icon" />} title="Education" desc="Track school inventory and supplies." href="/solutions/education" />
                  </div>

                  {/* Expand/collapse control spans full width; doesn't shift other sections */}
                  <div className="col-span-2">
                    {!showIndustriesMore ? (
                      <button
                        type="button"
                        onClick={() => setShowIndustriesMore(true)}
                        className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Show more industries
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowIndustriesMore(false)}
                        className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Hide industries
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Nav.Content>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/pricing" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 hover:text-[--primary] transition-colors inline-flex items-center gap-1">{dict.pricing.title}</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/about" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 hover:text-[--primary] transition-colors inline-flex items-center gap-1">{dict?.nav?.about ?? 'About'}</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link asChild>
            <Link href="/contact" className="px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 hover:text-[--primary] transition-colors inline-flex items-center gap-1">{dict?.nav?.contact ?? 'Contact'}</Link>
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
    <Link href={href} className="group flex gap-3 rounded-md p-3 hover:bg-gray-50 transition-colors">
      <span className="mt-0.5 icon-frame">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </Link>
  );
}

function SolutionItem({ icon, title, desc, href }: { icon: ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group flex gap-3 rounded-md p-3 hover:bg-gray-50 transition-colors">
      <span className="mt-0.5 icon-frame">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </Link>
  );
}
