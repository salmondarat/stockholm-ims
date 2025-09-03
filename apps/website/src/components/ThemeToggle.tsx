"use client";

import { useEffect, useState } from "react";

const KEY = "site-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as "light" | "dark" | null) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch {}
    try { document.cookie = `theme=${next}; Max-Age=${365*24*60*60}; Path=/; SameSite=Lax`; } catch {}
  };

  return (
    <button onClick={toggle} className="btn btn-pill text-sm border-gray-300 text-gray-900" aria-label="Toggle theme">
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
