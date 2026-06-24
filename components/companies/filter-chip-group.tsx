"use client";

import { cn } from "@/lib/utils";

export interface ChipOption {
  id: string;
  label: string;
  count?: number;
}

export function FilterChipGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: ChipOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-card text-ink hover:border-ink"
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span className={cn("ml-1.5 tabular-nums", active ? "text-paper/60" : "text-ink-soft")}>
                  {option.count.toLocaleString("en-US")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
