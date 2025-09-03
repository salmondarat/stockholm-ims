"use client";

import { useEffect, useState } from "react";

const KEY = "app-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as "light" | "dark" | null) || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return (
    <button onClick={toggle} className="text-sm px-2 py-1 border rounded">
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}

