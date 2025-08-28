import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AppHome() {
  const session = await auth();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Welcome, {session?.user?.email ?? "guest"}.</p>
      <Link className="underline" href="/app/items">
        Go to Items
      </Link>
    </main>
  );
}
