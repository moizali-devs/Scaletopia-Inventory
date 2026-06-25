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

export function PeopleFilterSlipClient() {
  const [options, setOptions] = useState<PersonFilterOptions>(EMPTY);

  useEffect(() => {
    fetch("/api/people/filter-options")
      .then((r) => {
        if (!r.ok) throw new Error(r.status.toString());
        return r.json();
      })
      .then((data: PersonFilterOptions) => setOptions(data))
      .catch(() => {});
  }, []);

  return <PeopleFilterSlip options={options} />;
}
