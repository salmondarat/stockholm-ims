"use client";

export default function ManageCookiesLink({ className = "hover:underline" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-consent"))}
    >
      Manage cookies
    </button>
  );
}

