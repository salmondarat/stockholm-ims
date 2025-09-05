import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";


export const metadata: Metadata = {
  title: "Stockholm IMS — Simple inventory for teams",
  description: "Track items, stock levels, and media with a fast, modern dashboard.",
};

import NavigationMenu from "../components/ui/navigation-menu";
import AuthButtons from "../components/AuthButtons";
import MobileNav from "../components/ui/mobile-nav";
import CookieConsent from "../components/CookieConsent";
import ManageCookiesLink from "../components/ManageCookiesLink";
import ConsentGates from "../components/ConsentGates";
import ThemeToggle from "../components/ThemeToggle";
import LanguagePicker from "../components/LanguagePicker";
import CurrencyDetector from "../components/CurrencyDetector";
import PageTransition from "../components/PageTransition";

function SiteHeader() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b relative">
      <div className="site-container py-3 flex items-center justify-between gap-4 text-gray-900">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded bg-[--brand]" />
          <span className="font-semibold">Stockholm IMS</span>
        </Link>
        <div className="hidden md:block">
          <NavigationMenu />
        </div>
        <div className="flex items-center gap-2">
          <AuthButtons />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return (
    <footer className="border-t border-subtle mt-16 text-[--foreground]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
          <div>
            <div className="font-semibold text-[--foreground]">Product</div>
            <ul className="mt-3 space-y-2 text-muted">
              <li><Link href="/features" className="hover:underline">Features</Link></li>
              <li><Link href="/solutions" className="hover:underline">Solutions</Link></li>
              <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
              <li><Link href={`${appUrl}/app`} className="hover:underline">Open App</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[--foreground]">Company</div>
            <ul className="mt-3 space-y-2 text-muted">
              <li><Link href="/about" className="hover:underline">About</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/sitemap" className="hover:underline">Sitemap</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[--foreground]">Legal</div>
            <ul className="mt-3 space-y-2 text-muted">
              <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms</Link></li>
              <li><ManageCookiesLink className="hover:underline" /></li>
            </ul>
          </div>
          <div className="flex items-start gap-2 justify-start sm:justify-end">
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-10 text-center text-sm text-muted">© {year} Stockholm IMS</div>
      </div>
    </footer>
  );
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const theme = (store.get("theme")?.value as "light" | "dark" | undefined) || "light";
  const lang = (store.get("lang")?.value as "en" | "id" | undefined) || "en";
  return (
    <html lang={lang} data-theme={theme}>
      <body className={`antialiased bg-[--background] text-[--foreground]`}>
        <SiteHeader />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
        <CookieConsent />
        <ConsentGates />
        <CurrencyDetector />
      </body>
    </html>
  );
}
