"use client";

import Image from "next/image";
import Link from "next/link";
import useI18n from "@/hooks/useI18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function FeaturesPage() {
  const { dict } = useI18n();
  return (
    <main className="max-w-6xl mx-auto px-4 py-14 space-y-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{dict.features.title}</h1>
        <p className="mt-2 text-muted">{dict.features.subtitle}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{dict.features.variantTitle}</h2>
          <p className="text-muted">{dict.features.variantBody}</p>
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
          <Image src="https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=1200&auto=format&fit=crop" alt="Variants" fill className="object-cover" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
          <Image src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop" alt="Barcode" fill className="object-cover" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{dict.features.barcodeTitle}</h2>
          <p className="text-muted">{dict.features.barcodeBody}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{dict.features.mediaTitle}</h2>
          <p className="text-muted">{dict.features.mediaBody}</p>
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-subtle">
          <Image src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1200&auto=format&fit=crop" alt="Media" fill className="object-cover" />
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex gap-3">
          <Link href={`${appUrl}/signup`} className="btn btn-primary">{dict.features.ctaCreate}</Link>
          <Link href={`${appUrl}/login`} className="btn btn-outline">{dict.features.ctaLogin}</Link>
        </div>
      </div>
    </main>
  );
}
