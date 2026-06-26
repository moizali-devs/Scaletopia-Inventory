"use client";

import { useEffect, useState } from "react";
import { PeopleFilterSlip } from "@/components/people/filter-slip";

interface FilterOption {
  id: string;
  label: string;
  count: number;
}
interface PersonFilterOptions {
  niches: FilterOption[];
  sources: FilterOption[];
  countries: FilterOption[];
  industries: FilterOption[];
  employeeBuckets: { id: string; label: string }[];
  emailStatuses: FilterOption[];
  phoneTypes: FilterOption[];
}

const EMPTY: PersonFilterOptions = {
  niches: [],
  sources: [],
  countries: [],
  industries: [],
  employeeBuckets: [],
  emailStatuses: [],
  phoneTypes: [],
};

let cached: PersonFilterOptions | null = null;
let inflight: Promise<PersonFilterOptions> | null = null;

function getOptions(): Promise<PersonFilterOptions> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/api/people/filter-options")
    .then((r) => {
      if (!r.ok) throw new Error(r.status.toString());
      return r.json() as Promise<PersonFilterOptions>;
    })
    .then((data) => {
      cached = data;
      return data;
    });
  return inflight;
}

export function PeopleFilterSlipClient() {
  const [options, setOptions] = useState<PersonFilterOptions>(cached ?? EMPTY);

  useEffect(() => {
    if (cached) return;
    getOptions().then(setOptions).catch(() => {});
  }, []);

  return <PeopleFilterSlip options={options} />;
}
