"use client";

import Link from "next/link";
import { useState } from "react";
import useI18n from "@/hooks/useI18n";
import { Smartphone, Barcode, QrCode, Plug, Bell, BarChart3, ChevronDown } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { dict } = useI18n();
  return (
    <div className="md:hidden relative">
      <button className="btn btn-pill text-sm border-gray-300 text-gray-900" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav-panel">
        Menu
      </button>
      {open && (
        <div id="mobile-nav-panel" className="absolute right-0 mt-2 w-72 rounded-2xl border bg-white text-gray-900 p-2 shadow-2xl">
          <Collapsible label={dict.features.title}>
            <MegaLink href="/features/mobile" icon={<Smartphone className="icon" />} title="Mobile App" />
            <MegaLink href="/features/barcoding" icon={<Barcode className="icon" />} title="Barcoding" />
            <MegaLink href="/features/qr" icon={<QrCode className="icon" />} title="QR Coding" />
            <MegaLink href="/features/integrations" icon={<Plug className="icon" />} title="Integrations" />
            <MegaLink href="/features/alerts" icon={<Bell className="icon" />} title="Alerts" />
            <MegaLink href="/features/reporting" icon={<BarChart3 className="icon" />} title="Reporting" />
          </Collapsible>
          <Collapsible label={dict?.solutions?.title ?? 'Solutions'}>
            <NavLink href="/solutions" onClick={() => setOpen(false)}>Retail</NavLink>
            <NavLink href="/solutions" onClick={() => setOpen(false)}>E‑commerce</NavLink>
            <NavLink href="/solutions" onClick={() => setOpen(false)}>IT Assets</NavLink>
          </Collapsible>
          <NavLink href="/pricing" onClick={() => setOpen(false)}>{dict.pricing.title}</NavLink>
          <NavLink href="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink href="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
          <div className="mt-2 border-t border-gray-200 pt-2 grid gap-2">
            <Link href={`${appUrl}/login`} className="btn btn-pill text-sm border-gray-300 text-gray-900" onClick={() => setOpen(false)}>Login</Link>
            <Link href={`${appUrl}/signup`} className="btn btn-cta btn-pill text-sm" onClick={() => setOpen(false)}>Start Free Trial</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50 hover:text-[--primary] transition-colors">
      {children}
    </Link>
  );
}

function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-md">
      <button className="group w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50 hover:text-[--primary] transition-colors" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} group-hover:-translate-y-0.5 group-hover:rotate-180`} />
      </button>
      {open && <div className="pl-2">{children}</div>}
    </div>
  );
}

function MegaLink({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
      <span className="icon-frame">{icon}</span>
      <span>{title}</span>
    </Link>
  );
}
