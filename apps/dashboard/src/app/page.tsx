import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="min-h-dvh">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-black" />
          <span className="font-semibold">Stockholm IMS</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="hover:underline" href="#features">
            Features
          </Link>
          <Link className="hover:underline" href="#tech">
            Tech
          </Link>
          <Link className="hover:underline" href="/app">
            Open App
          </Link>
          {!session?.user ? (
            <>
              <Link className="px-3 py-1.5 rounded border" href="/login">
                Log in
              </Link>
              <Link
                className="px-3 py-1.5 rounded bg-black text-white"
                href="/signup"
              >
                Sign up
              </Link>
            </>
          ) : (
            <form action={logoutAction}>
              <button className="px-3 py-1.5 rounded border" type="submit">
                Log out
              </button>
            </form>
          )}
        </nav>
      </header>

      <section className="px-6 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">
            Inventory, simplified.
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Track items, stock levels, and media with a fast, modern dashboard.
            Built-in barcode scanning, MinIO uploads, and low-stock alerts.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/app"
              className="px-4 py-2 rounded-md bg-black text-white"
            >
              Go to App
            </Link>
            {!session?.user ? (
              <>
                <Link href="/signup" className="px-4 py-2 rounded-md border">
                  Create account
                </Link>
                <Link href="/login" className="px-4 py-2 rounded-md border">
                  Log in
                </Link>
              </>
            ) : (
              <span className="text-sm text-gray-600">
                Signed in as {session.user.email}
              </span>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-14">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="p-5 border rounded-lg bg-white">
            <h3 className="font-semibold">Item Management</h3>
            <p className="mt-1 text-sm text-gray-600">
              Create, edit, tag, and locate items. Track quantity and condition
              with low-stock thresholds.
            </p>
          </div>
          <div className="p-5 border rounded-lg bg-white">
            <h3 className="font-semibold">Media Gallery</h3>
            <p className="mt-1 text-sm text-gray-600">
              Attach multiple images per item, pick a cover, reorder, and upload
              to local or MinIO (S3).
            </p>
          </div>
          <div className="p-5 border rounded-lg bg-white">
            <h3 className="font-semibold">Barcode & Export</h3>
            <p className="mt-1 text-sm text-gray-600">
              Scan barcodes, generate labels, and export inventory reports as
              PDF.
            </p>
          </div>
        </div>
      </section>

      <section id="tech" className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-semibold">Tech stack</h3>
          <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Next.js App Router (RSC) + Turbopack</li>
            <li>NextAuth (Credentials) sessions</li>
            <li>Prisma + PostgreSQL</li>
            <li>MinIO/S3 for media uploads</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
