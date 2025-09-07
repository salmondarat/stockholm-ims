"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  Search,
  Tag,
  Workflow,
  FileBarChart2,
  Megaphone,
  Bell,
  Settings,
  MessageCircleQuestion,
  LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ComponentType<any> };

const ITEMS: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/items", label: "Items", icon: Package },
  { href: "/app/search", label: "Search", icon: Search },
  { href: "/app/tags", label: "Tags", icon: Tag },
  { href: "/app/workflows", label: "Workflows", icon: Workflow },
  { href: "/app/reports", label: "Reports", icon: FileBarChart2 },
];

const FOOTER: NavItem[] = [
  { href: "/app/news", label: "Product News", icon: Megaphone },
  { href: "/app/help", label: "Help", icon: MessageCircleQuestion },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  variant = "desktop",
  user,
}: {
  variant?: "desktop" | "mobile";
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}) {
  const pathname = usePathname();
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const base = "flex flex-col justify-between text-white py-4 px-3";
  const desktopPos =
    "hidden md:flex fixed left-0 top-0 h-dvh md:w-60 lg:w-64 z-30 bg-[#280299]";
  const mobilePos = "flex w-72 h-full bg-[#280299]";
  const cls =
    variant === "mobile" ? `${mobilePos} ${base}` : `${desktopPos} ${base}`;

  return (
    <aside className={cls}>
      <div className="space-y-4">
        <div className="px-3 py-2 text-2xl font-semibold tracking-tight">
          Stockholm
        </div>
        <nav className="space-y-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/app" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white ${
                  active ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-1">
        <button className="mx-3 mb-2 inline-flex items-center justify-center rounded-full bg-white/95 text-[#280299] text-sm font-semibold px-4 py-2 shadow hover:bg-white">
          Upgrade
        </button>
        {FOOTER.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/10"
          >
            <Icon className="h-5 w-5 text-white" />
            <span className="text-sm text-white">{label}</span>
          </Link>
        ))}

        {/* Profile block */}
        <div className="mt-2 border-t border-white/20 pt-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10">
            <Link
              href="/app/profile"
              className="flex items-center gap-3 min-w-0"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt="avatar"
                  className="h-8 w-8 rounded-full bg-white/20 object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/90 text-[#280299] grid place-items-center text-sm font-bold">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm leading-4 font-medium truncate">
                  {user?.name || "Profile"}
                </div>
                <div className="text-xs text-white/80 truncate">
                  {user?.email || "Signed in"}
                </div>
              </div>
            </Link>
            <form
              method="post"
              action="/api/auth/signout"
              onSubmit={(e) => {
                if (!confirm("Logout now?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="callbackUrl" value="/" />
              <button
                aria-label="Logout"
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10"
                type="submit"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
