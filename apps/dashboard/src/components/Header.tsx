"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  LifeBuoy,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";

import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function Header({
  user,
}: {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition hover:bg-accent md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/app"
              className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground sm:inline-flex"
            >
              <span className="inline-flex h-7 items-center rounded-full bg-[#280299] px-2 text-xs font-semibold text-white shadow-sm">
                Stockholm IMS
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Dashboard
              </span>
            </Link>
            <div className="relative hidden min-w-0 flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search items, tags, or categories"
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-[#280299] focus:ring-2 focus:ring-[#280299]/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/app/help"
              className="hidden h-10 items-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-muted-foreground transition hover:border-border hover:text-foreground sm:inline-flex"
            >
              <LifeBuoy className="h-4 w-4" />
              Help
            </Link>
            <Link
              href="/app/settings"
              className="hidden h-10 items-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-muted-foreground transition hover:border-border hover:text-foreground lg:inline-flex"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition hover:border-border hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold text-muted-foreground transition hover:bg-secondary/80"
              aria-label="Open profile menu"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 shadow-2xl">
            <div className="relative flex w-full flex-col bg-[#280299] text-white">
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="px-4 pb-4 pt-12">
                <Sidebar variant="mobile" user={user} />
              </div>
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 shadow-2xl">
            <div className="relative flex w-full flex-col bg-background">
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-foreground transition hover:bg-muted/80"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="space-y-4 px-4 pb-6 pt-12">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt="Avatar"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-lg font-semibold text-foreground">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {user?.name ?? "Profile"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {user?.email ?? "Signed in"}
                    </div>
                  </div>
                </div>
                <nav className="space-y-1 text-sm">
                  <Link
                    href="/app/profile"
                    className="block rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/app/settings"
                    className="block rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/app/help"
                    className="block rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                  >
                    Help Center
                  </Link>
                  <form
                    method="post"
                    action="/api/auth/signout"
                    onSubmit={(event) => {
                      if (!confirm("Logout now?")) event.preventDefault();
                    }}
                  >
                    <input type="hidden" name="callbackUrl" value="/" />
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2 text-left text-destructive transition hover:bg-destructive/10"
                    >
                      Sign out
                    </button>
                  </form>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
