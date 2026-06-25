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

export function FilterSlipClient() {
  const [options, setOptions] = useState<CompanyFilterOptions>(EMPTY);

  useEffect(() => {
    fetch("/api/companies/filter-options")
      .then((r) => {
        if (!r.ok) throw new Error(r.status.toString());
        return r.json();
      })
      .then((data: CompanyFilterOptions) => setOptions(data))
      .catch(() => {});
  }, []);

  return <FilterSlip options={options} />;
}
