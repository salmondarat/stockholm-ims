"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "site-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved =
      (localStorage.getItem(KEY) as "light" | "dark" | null) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    try {
      document.cookie = `theme=${next}; Max-Age=${365 * 24 * 60 * 60}; Path=/; SameSite=Lax`;
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-500/40 text-gray-200 hover:bg-white/10"
      aria-label="Toggle theme"
      title={`Theme: ${theme}`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
