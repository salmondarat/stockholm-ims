"use client";

import useI18n from "@/hooks/useI18n";

export default function PrivacyPage() {
  const { dict } = useI18n();
  const title = dict?.legal?.privacyTitle ?? 'Privacy Policy';
  const body = dict?.legal?.privacyBody ?? 'We respect your privacy. This is a placeholder page — update with your real policy before launch.';
  return (
    <main className="max-w-4xl mx-auto px-4 py-14 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted">{body}</p>
    </main>
  );
}
