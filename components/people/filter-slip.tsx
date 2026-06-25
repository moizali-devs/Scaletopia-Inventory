"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { FilterChipGroup, type ChipOption } from "@/components/companies/filter-chip-group";
import { FilterPopover } from "@/components/shared/filter-popover";
import { SingleSelectGroup } from "@/components/people/single-select-group";
import type { PersonFilterOptions } from "@/lib/data/people";

const MULTI_PARAMS = [
  "niche",
  "source",
  "country",
  "employee",
  "industry",
  "emailStatus",
  "phoneType",
] as const;

export function PeopleFilterSlip({ options }: { options: PersonFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [jobTitle, setJobTitle] = useState(searchParams.get("title") ?? "");

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

  function commitText(param: string, value: string) {
    navigate((params) => {
      if (value.trim()) params.set(param, value.trim());
      else params.delete(param);
    });
  }

  function setSingleSelect(param: string, id: string) {
    navigate((params) => {
      if (id === "any") params.delete(param);
      else params.set(param, id);
    });
  }

  function clearAll() {
    setSearch("");
    setJobTitle("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const hasActiveFilters =
    Boolean(searchParams.get("q")) ||
    Boolean(searchParams.get("title")) ||
    Boolean(searchParams.get("email")) ||
    Boolean(searchParams.get("phone")) ||
    MULTI_PARAMS.some((p) => searchParams.getAll(p).length > 0);

  const toOptions = (entries: { id: string; label: string; count: number }[]): ChipOption[] =>
    entries.map((e) => ({ id: e.id, label: e.label, count: e.count }));

  const presenceCount =
    (searchParams.get("email") ? 1 : 0) + (searchParams.get("phone") ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] max-w-sm flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            commitText("q", e.target.value);
          }}
          placeholder="Search name or email"
          className="w-full rounded-md border border-rule bg-card py-1.5 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-stamp"
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => {
            setJobTitle(e.target.value);
            commitText("title", e.target.value);
          }}
          placeholder="Job title — founder, CEO, owner"
          className="w-full rounded-md border border-rule bg-card py-1.5 px-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-stamp"
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
      <FilterPopover label="Country" count={getAll("country").length}>
        <FilterChipGroup
          title="Country"
          options={toOptions(options.countries)}
          selected={getAll("country")}
          onToggle={(id) => toggle("country", id)}
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
      <FilterPopover label="Industry" count={getAll("industry").length}>
        <FilterChipGroup
          title="Industry"
          options={toOptions(options.industries)}
          selected={getAll("industry")}
          onToggle={(id) => toggle("industry", id)}
        />
      </FilterPopover>
      <FilterPopover label="Email status" count={getAll("emailStatus").length}>
        <FilterChipGroup
          title="Email status"
          options={toOptions(options.emailStatuses)}
          selected={getAll("emailStatus")}
          onToggle={(id) => toggle("emailStatus", id)}
        />
      </FilterPopover>
      <FilterPopover label="Phone type" count={getAll("phoneType").length}>
        <FilterChipGroup
          title="Phone type"
          options={toOptions(options.phoneTypes)}
          selected={getAll("phoneType")}
          onToggle={(id) => toggle("phoneType", id)}
        />
      </FilterPopover>
      <FilterPopover label="Has contact info" count={presenceCount}>
        <div className="flex flex-col gap-4">
          <SingleSelectGroup
            title="Email"
            value={searchParams.get("email") ?? "any"}
            onChange={(id) => setSingleSelect("email", id)}
          />
          <SingleSelectGroup
            title="Phone"
            value={searchParams.get("phone") ?? "any"}
            onChange={(id) => setSingleSelect("phone", id)}
          />
        </div>
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
  );
}
