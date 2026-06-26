import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/data/fetch-all-rows";
import { withTtlCache } from "@/lib/data/cache-with-ttl";
import { normalizeSourceTokens, sourceLabel } from "@/lib/data/source";
import { normalizeCountry } from "@/lib/data/country";
import { normalizeIndustry } from "@/lib/data/industry";
import { EMPLOYEE_BUCKETS, employeeBucketOf } from "@/lib/data/employee-size";
import { filterCustomData } from "@/lib/data/custom-data";
import { sortByLastUpdatedDesc } from "@/lib/data/sort";

export interface CompanyListFilters {
  search?: string;
  niche?: string[];
  source?: string[];
  industry?: string[];
  employeeBucket?: string[];
  country?: string[];
  employeeMin?: number;
  employeeMax?: number;
}

export interface CompanyListRow {
  id: string;
  companyName: string | null;
  domain: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  industry: string | null;
  employeeCount: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  niche: string | null;
  sources: string[];
  qualityTier: string | null;
  lastUpdated: string | null;
}

export interface CompanyListResult {
  rows: CompanyListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface CompanyFilterOptions {
  niches: FilterOption[];
  sources: FilterOption[];
  industries: FilterOption[];
  countries: FilterOption[];
  employeeBuckets: { id: string; label: string }[];
}

interface RawCompanyRow {
  id: string;
  company_name: string | null;
  domain: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  industry: string | null;
  employee_count: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  source: string | null;
  niche: string | null;
  quality_tier: string | null;
  last_updated: string | null;
}

const LIST_COLUMNS =
  "id,company_name,domain,website_url,linkedin_url,industry,employee_count,city,state,country,phone,source,niche,quality_tier,last_updated";

function employeeBucketOrClause(bucketIds: string[]): string {
  const buckets = EMPLOYEE_BUCKETS.filter((b) => bucketIds.includes(b.id));
  return buckets
    .map((b) =>
      b.max === null
        ? `employee_count.gte.${b.min}`
        : `and(employee_count.gte.${b.min},employee_count.lte.${b.max})`
    )
    .join(",");
}

/** Applies every filter that maps cleanly onto Postgres/PostgREST (search,
 * niche, employee buckets — all native columns with no casing/synonym mess),
 * then fetches the candidate set so Country/Industry/Source — whose raw
 * values have synonyms or casing variants the DB doesn't normalize — can be
 * matched in-app via the same normalizers used for Overview/display. */
async function fetchFilteredRowsUncached(filters: CompanyListFilters): Promise<RawCompanyRow[]> {
  const search = filters.search?.trim();

  const rows = await fetchAllRows<RawCompanyRow>("companies", LIST_COLUMNS, (query) => {
    let q = query;
    if (search) {
      const term = search.replace(/[%,]/g, "");
      q = q.or(`company_name.ilike.%${term}%,domain.ilike.%${term}%`);
    }
    if (filters.niche?.length) {
      q = q.in("niche", filters.niche);
    }
    if (filters.employeeMin != null || filters.employeeMax != null) {
      if (filters.employeeMin != null) q = q.gte("employee_count", filters.employeeMin);
      if (filters.employeeMax != null) q = q.lte("employee_count", filters.employeeMax);
    } else if (filters.employeeBucket?.length) {
      const clause = employeeBucketOrClause(filters.employeeBucket);
      if (clause) q = q.or(clause);
    }
    return q;
  });

  return rows.filter((row) => {
    if (filters.country?.length) {
      const country = normalizeCountry(row.country);
      if (!country || !filters.country.includes(country.id)) return false;
    }
    if (filters.industry?.length) {
      const industry = normalizeIndustry(row.industry);
      if (!industry || !filters.industry.includes(industry.id)) return false;
    }
    if (filters.source?.length) {
      const tokens = normalizeSourceTokens(row.source);
      if (!tokens.some((t) => filters.source!.includes(t))) return false;
    }
    return true;
  });
}

/** The companies table is ~29k rows; fetching and re-filtering all of it from
 * Supabase on every request (this page is force-dynamic) is the dominant cost
 * on /companies. Data here is synced in batches (see the "Synced ... UTC"
 * stamp in the UI), not edited live, so a cross-request cache trades a little
 * staleness for skipping that full-table round trip on every view. TTL
 * matches the page's own `revalidate = 3600`, since that's the staleness
 * window already accepted at the page level. */
const fetchFilteredRows = withTtlCache(fetchFilteredRowsUncached, 3_600_000);

const fetchFilterOptionRows = withTtlCache(
  () => fetchAllRows<RawCompanyRow>("companies", "niche,source,industry,country"),
  3_600_000
);

function toListRow(row: RawCompanyRow): CompanyListRow {
  return {
    id: row.id,
    companyName: row.company_name,
    domain: row.domain,
    websiteUrl: row.website_url,
    linkedinUrl: row.linkedin_url,
    industry: row.industry,
    employeeCount: row.employee_count,
    city: row.city,
    state: row.state,
    country: row.country,
    phone: row.phone,
    niche: row.niche,
    sources: normalizeSourceTokens(row.source),
    qualityTier: row.quality_tier,
    lastUpdated: row.last_updated,
  };
}

export async function getCompanies(
  filters: CompanyListFilters,
  page = 1,
  pageSize = 50
): Promise<CompanyListResult> {
  const rows = sortByLastUpdatedDesc(await fetchFilteredRows(filters));
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize).map(toListRow),
    total: rows.length,
    page,
    pageSize,
  };
}

/** Same query + filtering as getCompanies, with no pagination — the export
 * function must run through the identical filtered query, not a separate path. */
export async function getAllFilteredCompanies(
  filters: CompanyListFilters
): Promise<CompanyListRow[]> {
  return sortByLastUpdatedDesc(await fetchFilteredRows(filters)).map(toListRow);
}

export async function getCompanyFilterOptions(): Promise<CompanyFilterOptions> {
  const rows = await fetchFilterOptionRows();

  const niches = new Map<string, number>();
  const sources = new Map<string, number>();
  const industries = new Map<string, { label: string; count: number }>();
  const countries = new Map<string, { label: string; count: number }>();

  for (const row of rows) {
    if (row.niche) niches.set(row.niche, (niches.get(row.niche) ?? 0) + 1);

    for (const token of normalizeSourceTokens(row.source)) {
      sources.set(token, (sources.get(token) ?? 0) + 1);
    }

    const industry = normalizeIndustry(row.industry);
    if (industry) {
      const existing = industries.get(industry.id);
      industries.set(industry.id, { label: industry.label, count: (existing?.count ?? 0) + 1 });
    }

    const country = normalizeCountry(row.country);
    if (country) {
      const existing = countries.get(country.id);
      countries.set(country.id, { label: country.label, count: (existing?.count ?? 0) + 1 });
    }
  }

  const sortDesc = <T extends { count: number }>(a: T, b: T) => b.count - a.count;

  return {
    niches: Array.from(niches.entries())
      .map(([id, count]) => ({ id, label: id, count }))
      .sort(sortDesc),
    sources: Array.from(sources.entries())
      .map(([id, count]) => ({ id, label: sourceLabel(id), count }))
      .sort(sortDesc),
    industries: Array.from(industries.entries())
      .map(([id, { label, count }]) => ({ id, label, count }))
      .sort(sortDesc),
    countries: Array.from(countries.entries())
      .map(([id, { label, count }]) => ({ id, label, count }))
      .sort(sortDesc),
    employeeBuckets: EMPLOYEE_BUCKETS.map((b) => ({ id: b.id, label: b.label })),
  };
}

export interface CompanyDetail {
  id: string;
  companyName: string | null;
  domain: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  industry: string | null;
  employeeCount: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  description: string | null;
  foundedYear: number | null;
  revenue: number | null;
  sources: string[];
  niche: string | null;
  client: string | null;
  tags: string[];
  lastUpdated: string | null;
  domainStatus: string | null;
  mxProvider: string | null;
  securityGateway: string | null;
  qualityTier: string | null;
  keywords: string[] | null;
  technologies: string[] | null;
  customData: Record<string, unknown>;
}

export async function getCompanyDetail(id: string): Promise<CompanyDetail | null> {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    companyName: data.company_name,
    domain: data.domain,
    websiteUrl: data.website_url,
    linkedinUrl: data.linkedin_url,
    industry: data.industry,
    employeeCount: data.employee_count,
    city: data.city,
    state: data.state,
    country: data.country,
    phone: data.phone,
    description: data.description,
    foundedYear: data.founded_year,
    revenue: data.revenue,
    sources: normalizeSourceTokens(data.source),
    niche: data.niche,
    client: data.client,
    tags: data.tags ?? [],
    lastUpdated: data.last_updated,
    domainStatus: data.domain_status,
    mxProvider: data.mx_provider,
    securityGateway: data.security_gateway,
    qualityTier: data.quality_tier,
    keywords: data.keywords,
    technologies: data.technologies,
    customData: filterCustomData(data.custom_data),
  };
}

export { employeeBucketOf };
