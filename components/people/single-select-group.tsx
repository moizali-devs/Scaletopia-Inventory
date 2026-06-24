"use client";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "any", label: "Any" },
  { id: "not_empty", label: "Not empty" },
  { id: "empty", label: "Empty" },
];

export function SingleSelectGroup({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-card text-ink hover:border-ink"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
