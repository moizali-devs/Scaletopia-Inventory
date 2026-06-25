"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { FilterChipGroup, type ChipOption } from "@/components/companies/filter-chip-group";
import { FilterPopover } from "@/components/shared/filter-popover";
import type { CompanyFilterOptions } from "@/lib/data/companies";

const MULTI_PARAMS = ["niche", "source", "industry", "employee", "country"] as const;

export function FilterSlip({ options }: { options: CompanyFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function getAll(param: string): string[] {
    return searchParams.getAll(param);
  }

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function toggle(param: string, id: string) {
    navigate((params) => {
      const current = params.getAll(param);
      params.delete(param);
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      for (const value of next) params.append(param, value);
    });
  }

  function commitSearch(value: string) {
    navigate((params) => {
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
    });
  }

  function clearAll() {
    setSearch("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const hasActiveFilters =
    Boolean(searchParams.get("q")) || MULTI_PARAMS.some((p) => searchParams.getAll(p).length > 0);

  const toOptions = (entries: { id: string; label: string; count: number }[]): ChipOption[] =>
    entries.map((e) => ({ id: e.id, label: e.label, count: e.count }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              commitSearch(e.target.value);
            }}
            placeholder="Search name or domain"
            className="w-full rounded-md border border-rule bg-card py-1.5 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-stamp"
          />
        </div>

        <FilterPopover label="Niche" count={getAll("niche").length}>
          <FilterChipGroup
            title="Niche"
            options={toOptions(options.niches)}
            selected={getAll("niche")}
            onToggle={(id) => toggle("niche", id)}
          />
        </FilterPopover>
        <FilterPopover label="Source" count={getAll("source").length}>
          <FilterChipGroup
            title="Source"
            options={toOptions(options.sources)}
            selected={getAll("source")}
            onToggle={(id) => toggle("source", id)}
          />
        </FilterPopover>
        <FilterPopover label="Industry" count={getAll("industry").length}>
          <FilterChipGroup
            title="Industry"
            options={toOptions(options.industries)}
            selected={getAll("industry")}
            onToggle={(id) => toggle("industry", id)}
          />
        </FilterPopover>
        <FilterPopover label="Employee size" count={getAll("employee").length}>
          <FilterChipGroup
            title="Employee size"
            options={options.employeeBuckets.map((b) => ({ id: b.id, label: b.label }))}
            selected={getAll("employee")}
            onToggle={(id) => toggle("employee", id)}
          />
        </FilterPopover>
        <FilterPopover label="Country" count={getAll("country").length}>
          <FilterChipGroup
            title="Country"
            options={toOptions(options.countries)}
            selected={getAll("country")}
            onToggle={(id) => toggle("country", id)}
          />
        </FilterPopover>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-stamp underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
