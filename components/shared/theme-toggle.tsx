"use client";

import { Moon, Sun } from "lucide-react";

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="inline-flex size-8 items-center justify-center rounded-md border border-rule text-ink-soft transition-colors hover:bg-rule/30 hover:text-ink"
    >
      <Moon size={16} className="theme-toggle-moon" />
      <Sun size={16} className="theme-toggle-sun" />
    </button>
  );
}
