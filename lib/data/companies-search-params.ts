import type { CompanyListFilters } from "@/lib/data/companies";

/** Shared between the Companies page (server-rendered searchParams) and the
 * CSV export route (URL query string) so both read filters identically. */
export function parseCompanyFilters(searchParams: URLSearchParams): CompanyListFilters {
  const search = searchParams.get("q") ?? undefined;
  return {
    search,
    niche: searchParams.getAll("niche"),
    source: searchParams.getAll("source"),
    industry: searchParams.getAll("industry"),
    employeeBucket: searchParams.getAll("employee"),
    country: searchParams.getAll("country"),
  };
}

export function parsePage(searchParams: URLSearchParams): number {
  const page = Number(searchParams.get("page") ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}
