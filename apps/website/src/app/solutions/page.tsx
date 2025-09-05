"use client";

import Image from "next/image";
import Link from "next/link";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function SolutionsPage() {
  const { dict } = useI18n();
  return (
    <main className="max-w-6xl mx-auto px-4 py-14 space-y-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{dict?.solutions?.title ?? 'Solutions'}</h1>
        <p className="mt-2 text-muted">{dict?.solutions?.subtitle ?? 'Use Stockholm IMS for retail, e‑commerce, or internal IT asset tracking.'}</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: dict?.solutions?.retail ?? 'Retail', img: "/mock-generic.svg", desc: dict?.solutions?.retailDesc ?? 'In‑store stock and variants.' },
          { title: dict?.solutions?.ecom ?? 'E‑commerce', img: "/mock-media.svg", desc: dict?.solutions?.ecomDesc ?? 'Catalog management and SKUs.' },
          { title: dict?.solutions?.it ?? 'IT Assets', img: "/mock-generic.svg", desc: dict?.solutions?.itDesc ?? 'Devices, labels, and locations.' },
        ].map((s) => (
          <div key={s.title} className="rounded-xl overflow-hidden border border-subtle bg-card">
            <div className="relative aspect-[4/3]">
              <Image src={s.img} alt={s.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-muted mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href={`${appUrl}/signup`} className="btn btn-primary">{dict?.features?.ctaCreate ?? 'Get started'}</Link>
      </div>
    </main>
  );
}
