"use client";

import Link from "next/link";
import useI18n from "@/hooks/useI18n";

export default function AuthButtons() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { dict } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${appUrl}/login`}
        className="btn btn-pill border-gray-300 text-gray-900 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 transition-colors"
      >
        {dict?.nav?.login ?? 'Login'}
      </Link>
      <Link
        href={`${appUrl}/signup`}
        className="btn btn-cta btn-pill whitespace-nowrap text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 transition-colors"
      >
        {dict?.nav?.startTrial ?? 'Start Free Trial'}
      </Link>
    </div>
  );
}
