"use client";

import useI18n from "@/hooks/useI18n";

export default function TermsPage() {
  const { dict } = useI18n();
  const title = dict?.legal?.termsTitle ?? "Terms of Service";
  const body =
    dict?.legal?.termsBody ??
    "These terms are placeholders for development. Replace with your actual terms before going live.";
  return (
    <main className="max-w-4xl mx-auto px-4 py-14 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted">{body}</p>
    </main>
  );
}
