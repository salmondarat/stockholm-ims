import Link from "next/link";

import LowStockBadgeClient from "./LowStockBadge";
import ThemeToggle from "./ThemeToggle";

export default async function Navbar() {
  // SSR, cached 60s kecuali di-revalidate

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/app">Dashboard</Link>
        <Link href="/app/items">Items</Link>
        <Link
          href="/app/items?filter=low"
          className="relative inline-flex items-center gap-2"
        >
          <span>Low Stock</span>
          <LowStockBadgeClient />
        </Link>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
        <ThemeToggle />
        <span>Stockholm IMS</span>
      </div>
    </nav>
  );
}
