"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterChipGroup, type ChipOption } from "@/components/companies/filter-chip-group";
import { Perforation } from "@/components/companies/perforation";
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
    <section className="border border-rule bg-card">
      <div className="flex items-baseline justify-between gap-3 px-5 py-3">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
          Requisition slip
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-[11px] uppercase tracking-wide text-stamp underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <Perforation />

      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="company-search"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft"
          >
            Search — name or domain
          </label>
          <input
            id="company-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              commitSearch(e.target.value);
            }}
            placeholder="acme.com"
            className="border-0 border-b border-rule bg-transparent py-1 font-mono text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-stamp"
          />
        </div>

        <FilterChipGroup
          title="Niche"
          options={toOptions(options.niches)}
          selected={getAll("niche")}
          onToggle={(id) => toggle("niche", id)}
        />
        <FilterChipGroup
          title="Source"
          options={toOptions(options.sources)}
          selected={getAll("source")}
          onToggle={(id) => toggle("source", id)}
        />
        <FilterChipGroup
          title="Industry"
          options={toOptions(options.industries)}
          selected={getAll("industry")}
          onToggle={(id) => toggle("industry", id)}
        />
        <FilterChipGroup
          title="Employee size"
          options={options.employeeBuckets.map((b) => ({ id: b.id, label: b.label }))}
          selected={getAll("employee")}
          onToggle={(id) => toggle("employee", id)}
        />
        <FilterChipGroup
          title="Country"
          options={toOptions(options.countries)}
          selected={getAll("country")}
          onToggle={(id) => toggle("country", id)}
        />
      </div>
    </section>
  );
}
