import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockholm IMS — Simple inventory for teams",
  description:
    "Track items, stock levels, and media with a fast, modern dashboard.",
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
import ChatWidget from "../components/ChatWidget";

function SiteHeader({ theme }: { theme: "light" | "dark" }) {
  const logoSrc =
    theme === "dark"
      ? "/brand/horizontal-white.svg"
      : "/brand/horizontal-black.svg";
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b relative">
      <div className="site-container py-3 flex items-center justify-between gap-4 text-gray-900">
        <Link href="/" className="flex items-center gap-2" aria-label="Stockholm IMS home">
          <Image
            src={logoSrc}
            alt="Stockholm IMS"
            width={150}
            height={32}
            style={{ height: 28, width: "auto" }}
            priority
          />
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
    <footer className="mt-16 bg-gray-950 text-gray-200 border-t border-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
          <div>
            <div className="font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-gray-400">
              <li>
                <Link
                  href="/features"
                  className="hover:underline hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="hover:underline hover:text-white"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:underline hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={`${appUrl}/app`}
                  className="hover:underline hover:text-white"
                >
                  Open App
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:underline hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:underline hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="hover:underline hover:text-white"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <ul className="mt-3 space-y-2 text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:underline hover:text-white"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:underline hover:text-white"
                >
                  Terms
                </Link>
              </li>
              <li>
                <ManageCookiesLink className="hover:underline hover:text-white" />
              </li>
            </ul>
          </div>
          <div className="flex items-start gap-3 justify-start sm:justify-end">
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-10 text-center text-sm text-gray-400">
          © {year} Stockholm IMS
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const theme =
    (store.get("theme")?.value as "light" | "dark" | undefined) || "light";
  const lang = (store.get("lang")?.value as "en" | "id" | undefined) || "en";
  return (
    <html lang={lang} data-theme={theme}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`antialiased bg-[--background] text-[--foreground]`}>
        <SiteHeader theme={theme} />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
        <ChatWidget />
        <CookieConsent />
        <ConsentGates />
        <CurrencyDetector />
      </body>
    </html>
  );
}
