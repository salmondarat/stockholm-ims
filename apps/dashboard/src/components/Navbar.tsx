import Link from "next/link";

import LowStockBadgeClient from "./LowStockBadge";

export default async function Navbar() {
  // SSR, cached 60s kecuali di-revalidate

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-4">
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
      <div className="text-sm text-muted-foreground">Stockholm IMS</div>
    </nav>
  );
}
