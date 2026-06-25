"use client";

import { Moon, Sun } from "lucide-react";

function applyTheme(next: string) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

  const supportsViewTransitions = typeof document.startViewTransition === "function";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsViewTransitions || prefersReducedMotion) {
    applyTheme(next);
    return;
  }

  const { clientX, clientY } = event;
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  );
  root.style.setProperty("--theme-toggle-x", `${clientX}px`);
  root.style.setProperty("--theme-toggle-y", `${clientY}px`);
  root.style.setProperty("--theme-toggle-radius", `${maxRadius}px`);

  document.startViewTransition(() => applyTheme(next));
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
