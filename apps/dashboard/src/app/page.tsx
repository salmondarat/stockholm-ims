import Link from "next/link";
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stockholm IMS</h1>
      <Link className="underline" href="/app">
        Go to App
      </Link>
    </main>
  );
}
