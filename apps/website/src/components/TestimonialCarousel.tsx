"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
};

const ITEMS: Testimonial[] = [
  { quote: "We replaced spreadsheets in a week.", author: "Ava M.", role: "Ops Lead, Retail", avatar: "/logos/partners/stripe.svg" },
  { quote: "Barcode scanning on phones is a game‑changer.", author: "Luis R.", role: "Warehouse Manager", avatar: "/logos/partners/github.svg" },
  { quote: "The variant system fits our catalog perfectly.", author: "Mira K.", role: "E‑commerce Director", avatar: "/logos/partners/shopify.svg" },
];

export default function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  const total = ITEMS.length;
  const active = useMemo(() => ITEMS[idx], [idx]);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % total), 4200);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl border border-subtle bg-card p-6 relative overflow-hidden">
        <p className="text-lg">“{active.quote}”</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white border border-subtle grid place-items-center overflow-hidden">
            {active.avatar ? (
              <Image src={active.avatar} alt="" width={24} height={24} className="opacity-80" />
            ) : (
              <span className="text-xs">🙂</span>
            )}
          </div>
          <div className="text-sm">
            <div className="font-medium">{active.author}</div>
            {active.role && <div className="text-muted">{active.role}</div>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 w-2 rounded-full ${i === idx ? "bg-[--primary]" : "bg-gray-300"}`}
              aria-label={`Go to slide ${i + 1}`}
            />)
          )}
        </div>
      </div>
    </div>
  );
}

