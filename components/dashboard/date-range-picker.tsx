"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { FilterPopover } from "@/components/shared/filter-popover";
import type { DateRangePreset } from "@/lib/data/dashboard-search-params";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function currentLabel(searchParams: URLSearchParams): string {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
  if (from) return `Since ${formatDate(from)}`;
  if (to) return `Until ${formatDate(to)}`;

  const preset = searchParams.get("range") ?? "all";
  return PRESETS.find((p) => p.id === preset)?.label ?? "All time";
}

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const hasCustom = Boolean(searchParams.get("from") || searchParams.get("to"));
  const activePreset = searchParams.get("range") ?? "all";
  const isActive = hasCustom || activePreset !== "all";

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function applyPreset(id: DateRangePreset) {
    setFrom("");
    setTo("");
    navigate((params) => {
      params.delete("from");
      params.delete("to");
      if (id === "all") params.delete("range");
      else params.set("range", id);
    });
  }

  function applyCustom() {
    navigate((params) => {
      params.delete("range");
      if (from) params.set("from", from);
      else params.delete("from");
      if (to) params.set("to", to);
      else params.delete("to");
    });
  }

  return (
    <FilterPopover label={currentLabel(searchParams)} count={isActive ? 1 : 0}>
      <div className="flex flex-col gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            className={cn(
              "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              !hasCustom && activePreset === p.id
                ? "bg-stamp/10 font-medium text-stamp"
                : "text-ink hover:bg-hover"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-rule pt-3">
        <p className="text-xs font-medium text-ink-soft">Custom range</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-md border border-rule bg-card px-2 py-1 text-sm text-ink outline-none focus:border-stamp"
          />
          <span className="text-ink-mute">–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-md border border-rule bg-card px-2 py-1 text-sm text-ink outline-none focus:border-stamp"
          />
        </div>
        <button
          type="button"
          onClick={applyCustom}
          disabled={!from && !to}
          className="rounded-md bg-stamp px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </FilterPopover>
  );
}
