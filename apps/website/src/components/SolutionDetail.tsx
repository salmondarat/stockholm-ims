import SafeImage from "@/components/SafeImage";
import Link from "next/link";

export type SolutionSpec = {
  title: string;
  desc: string;
  image: string;
  bullets?: string[];
};

export default function SolutionDetail({ spec }: { spec: SolutionSpec }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return (
    <main className="max-w-5xl mx-auto px-4 py-14 space-y-10">
      <nav className="text-sm text-muted">
        <Link href="/solutions" className="hover:underline">
          Solutions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{spec.title}</span>
      </nav>

      <header className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <h1 className="text-3xl font-bold">{spec.title}</h1>
          <p className="mt-2 text-muted">{spec.desc}</p>
          {spec.bullets && (
            <ul className="mt-4 list-disc pl-5 space-y-1 text-sm text-muted">
              {spec.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 inline-flex gap-3">
            <Link href={`${appUrl}/signup`} className="btn btn-primary">
              Get started
            </Link>
            <Link href={`${appUrl}/login`} className="btn btn-outline">
              Log in
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle bg-card">
          <SafeImage
            src={spec.image}
            alt={spec.title}
            fill
            className="object-cover"
          />
        </div>
      </header>
    </main>
  );
}
