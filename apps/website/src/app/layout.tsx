import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 text-gray-900">
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
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted grid gap-4 sm:grid-cols-3 items-center">
        <div className="order-2 sm:order-1 text-center sm:text-left">© {year} Stockholm IMS</div>
        <div className="order-3 sm:order-2 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href={`${appUrl}/app`} className="hover:underline">Open App</Link>
          <ManageCookiesLink className="hover:underline" />
        </div>
        <div className="order-1 sm:order-3 flex items-center justify-center sm:justify-end gap-2">
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const store = cookies();
  const theme = (store.get("theme")?.value as "light" | "dark" | undefined) || "light";
  const lang = (store.get("lang")?.value as "en" | "id" | undefined) || "en";
  return (
    <html lang={lang} data-theme={theme}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[--background] text-[--foreground]`}>
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
