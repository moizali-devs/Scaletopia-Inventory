import type { PersonListFilters, SingleSelectFilter } from "@/lib/data/people";

function asSingleSelect(value: string | null): SingleSelectFilter | undefined {
  return value === "any" || value === "not_empty" || value === "empty" ? value : undefined;
}

/** Shared between the People page (server-rendered searchParams) and the
 * CSV export route (URL query string) so both read filters identically. */
export function parsePersonFilters(searchParams: URLSearchParams): PersonListFilters {
  const empMin = searchParams.get("empmin");
  const empMax = searchParams.get("empmax");
  return {
    search: searchParams.get("q") ?? undefined,
    niche: searchParams.getAll("niche"),
    source: searchParams.getAll("source"),
    country: searchParams.getAll("country"),
    employeeBucket: searchParams.getAll("employee"),
    industry: searchParams.getAll("industry"),
    email: asSingleSelect(searchParams.get("email")),
    phone: asSingleSelect(searchParams.get("phone")),
    emailStatus: searchParams.getAll("emailStatus"),
    phoneType: searchParams.getAll("phoneType"),
    jobTitle: searchParams.get("title") ?? undefined,
    employeeMin: Number.isFinite(Number(empMin)) && empMin ? Number(empMin) : undefined,
    employeeMax: Number.isFinite(Number(empMax)) && empMax ? Number(empMax) : undefined,
  };
}
