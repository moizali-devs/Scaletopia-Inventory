"use client";

import { useEffect, useState } from "react";
import { FilterSlip } from "@/components/companies/filter-slip";

interface FilterOption {
  id: string;
  label: string;
  count: number;
}
interface CompanyFilterOptions {
  niches: FilterOption[];
  sources: FilterOption[];
  industries: FilterOption[];
  countries: FilterOption[];
  employeeBuckets: { id: string; label: string }[];
  [key: string]: unknown;
}

const EMPTY: CompanyFilterOptions = {
  niches: [],
  sources: [],
  industries: [],
  countries: [],
  employeeBuckets: [],
};

let cached: CompanyFilterOptions | null = null;
let inflight: Promise<CompanyFilterOptions> | null = null;

function getOptions(): Promise<CompanyFilterOptions> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/api/companies/filter-options")
    .then((r) => {
      if (!r.ok) throw new Error(r.status.toString());
      return r.json() as Promise<CompanyFilterOptions>;
    })
    .then((data) => {
      cached = data;
      return data;
    });
  return inflight;
}

export function FilterSlipClient() {
  const [options, setOptions] = useState<CompanyFilterOptions>(cached ?? EMPTY);

  useEffect(() => {
    if (cached) return;
    getOptions().then(setOptions).catch(() => {});
  }, []);

  return <FilterSlip options={options} />;
}
