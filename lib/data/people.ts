import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/data/fetch-all-rows";
import { normalizeSourceTokens, sourceLabel } from "@/lib/data/source";
import { normalizeCountry } from "@/lib/data/country";
import { normalizeIndustry } from "@/lib/data/industry";
import { EMPLOYEE_BUCKETS, employeeBucketOf } from "@/lib/data/employee-size";
import { filterCustomData } from "@/lib/data/custom-data";
import { nichesFromTags } from "@/lib/data/niche";
import { sortByLastUpdatedDesc } from "@/lib/data/sort";

export type SingleSelectFilter = "any" | "not_empty" | "empty";

export interface PersonListFilters {
  search?: string;
  niche?: string[];
  source?: string[];
  country?: string[];
  employeeBucket?: string[];
  industry?: string[];
  email?: SingleSelectFilter;
  phone?: SingleSelectFilter;
  emailStatus?: string[];
  phoneType?: string[];
  jobTitle?: string;
}

export interface PersonListRow {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  email: string | null;
  emailStatus: string | null;
  phone: string | null;
  phoneType: string | null;
  companyName: string | null;
  country: string | null;
  sources: string[];
  lastUpdated: string | null;
}

export interface PersonListResult {
  rows: PersonListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface PersonFilterOptions {
  niches: FilterOption[];
  sources: FilterOption[];
  countries: FilterOption[];
  industries: FilterOption[];
  employeeBuckets: { id: string; label: string }[];
  emailStatuses: FilterOption[];
  phoneTypes: FilterOption[];
}

interface RawPersonRow {
  id: string;
  company_id: string | null;
  full_name: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  source: string | null;
  tags: string[] | null;
  last_updated: string | null;
  email_status: string | null;
  phone_type: string | null;
  company_name: string | null;
}

const LIST_COLUMNS =
  "id,company_id,full_name,job_title,email,phone,country,source,tags,last_updated,email_status,phone_type,company_name";

interface LinkedCompanyJoinRow {
  niche: string | null;
  employee_count: number | null;
  industry: string | null;
}

interface CompanyJoinData {
  byId: Map<string, LinkedCompanyJoinRow>;
  knownClients: Set<string>;
}

/** Companies have native niche/employee_count/industry columns people lack on
 * their own row, so Employee Size, Industry, and (when the linked company's
 * niche is empty) Niche all need this join. `knownClients` — derived from
 * `client` rather than an external list — backs the tag-parsing niche
 * fallback in `niche.ts`. */
async function loadCompanyJoinData(): Promise<CompanyJoinData> {
  const rows = await fetchAllRows<{
    id: string;
    niche: string | null;
    employee_count: number | null;
    industry: string | null;
    client: string | null;
  }>("companies", "id,niche,employee_count,industry,client");

  const byId = new Map<string, LinkedCompanyJoinRow>();
  const knownClients = new Set<string>();
  for (const row of rows) {
    byId.set(row.id, {
      niche: row.niche,
      employee_count: row.employee_count,
      industry: row.industry,
    });
    if (row.client) knownClients.add(row.client.trim().toLowerCase());
  }
  return { byId, knownClients };
}

function personNiches(
  row: { tags: string[] | null },
  company: LinkedCompanyJoinRow | undefined,
  knownClients: ReadonlySet<string>
): string[] {
  if (company?.niche) return [company.niche];
  return nichesFromTags(row.tags, knownClients);
}

function jobTitleTerms(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Mirrors the Companies data layer's split: native-column filters
 * (search, email status, phone type) run through PostgREST; everything
 * touching synonyms, joins, or tag-parsing (country/source/industry/employee
 * size/niche/email-or-phone-presence/job title) is matched in-app against
 * the candidate set. */
async function fetchFilteredRows(
  filters: PersonListFilters,
  companyData: CompanyJoinData
): Promise<RawPersonRow[]> {
  const search = filters.search?.trim();

  const rows = await fetchAllRows<RawPersonRow>("people", LIST_COLUMNS, (query) => {
    let q = query;
    if (search) {
      const term = search.replace(/[%,]/g, "");
      q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
    }
    if (filters.emailStatus?.length) q = q.in("email_status", filters.emailStatus);
    if (filters.phoneType?.length) q = q.in("phone_type", filters.phoneType);
    return q;
  });

  const titleTerms = jobTitleTerms(filters.jobTitle);

  return rows.filter((row) => {
    if (filters.email === "not_empty" && !row.email) return false;
    if (filters.email === "empty" && row.email) return false;
    if (filters.phone === "not_empty" && !row.phone) return false;
    if (filters.phone === "empty" && row.phone) return false;

    if (titleTerms.length) {
      const title = row.job_title?.toLowerCase() ?? "";
      if (!titleTerms.some((t) => title.includes(t))) return false;
    }

    if (filters.country?.length) {
      const country = normalizeCountry(row.country);
      if (!country || !filters.country.includes(country.id)) return false;
    }

    if (filters.source?.length) {
      const tokens = normalizeSourceTokens(row.source);
      if (!tokens.some((t) => filters.source!.includes(t))) return false;
    }

    const company = row.company_id ? companyData.byId.get(row.company_id) : undefined;

    if (filters.industry?.length) {
      const industry = normalizeIndustry(company?.industry);
      if (!industry || !filters.industry.includes(industry.id)) return false;
    }

    if (filters.employeeBucket?.length) {
      const bucket = employeeBucketOf(company?.employee_count);
      if (!bucket || !filters.employeeBucket.includes(bucket.id)) return false;
    }

    if (filters.niche?.length) {
      const niches = personNiches(row, company, companyData.knownClients);
      if (!niches.some((n) => filters.niche!.includes(n))) return false;
    }

    return true;
  });
}

function toListRow(row: RawPersonRow): PersonListRow {
  return {
    id: row.id,
    fullName: row.full_name,
    jobTitle: row.job_title,
    email: row.email,
    emailStatus: row.email_status,
    phone: row.phone,
    phoneType: row.phone_type,
    companyName: row.company_name,
    country: row.country,
    sources: normalizeSourceTokens(row.source),
    lastUpdated: row.last_updated,
  };
}

export async function getPeople(
  filters: PersonListFilters,
  page = 1,
  pageSize = 50
): Promise<PersonListResult> {
  const companyData = await loadCompanyJoinData();
  const rows = sortByLastUpdatedDesc(await fetchFilteredRows(filters, companyData));
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize).map(toListRow),
    total: rows.length,
    page,
    pageSize,
  };
}

/** Same query + filtering as getPeople, with no pagination — the export
 * function must run through the identical filtered query, not a separate path. */
export async function getAllFilteredPeople(filters: PersonListFilters): Promise<PersonListRow[]> {
  const companyData = await loadCompanyJoinData();
  return sortByLastUpdatedDesc(await fetchFilteredRows(filters, companyData)).map(toListRow);
}

export async function getPersonFilterOptions(): Promise<PersonFilterOptions> {
  const companyData = await loadCompanyJoinData();
  const rows = await fetchAllRows<{
    company_id: string | null;
    source: string | null;
    country: string | null;
    tags: string[] | null;
    email_status: string | null;
    phone_type: string | null;
  }>("people", "company_id,source,country,tags,email_status,phone_type");

  const niches = new Map<string, number>();
  const sources = new Map<string, number>();
  const countries = new Map<string, { label: string; count: number }>();
  const industries = new Map<string, { label: string; count: number }>();
  const emailStatuses = new Map<string, number>();
  const phoneTypes = new Map<string, number>();

  for (const row of rows) {
    const company = row.company_id ? companyData.byId.get(row.company_id) : undefined;

    for (const niche of personNiches(row, company, companyData.knownClients)) {
      niches.set(niche, (niches.get(niche) ?? 0) + 1);
    }

    for (const token of normalizeSourceTokens(row.source)) {
      sources.set(token, (sources.get(token) ?? 0) + 1);
    }

    const country = normalizeCountry(row.country);
    if (country) {
      const existing = countries.get(country.id);
      countries.set(country.id, { label: country.label, count: (existing?.count ?? 0) + 1 });
    }

    const industry = normalizeIndustry(company?.industry);
    if (industry) {
      const existing = industries.get(industry.id);
      industries.set(industry.id, { label: industry.label, count: (existing?.count ?? 0) + 1 });
    }

    if (row.email_status) {
      emailStatuses.set(row.email_status, (emailStatuses.get(row.email_status) ?? 0) + 1);
    }
    if (row.phone_type) {
      phoneTypes.set(row.phone_type, (phoneTypes.get(row.phone_type) ?? 0) + 1);
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
    countries: Array.from(countries.entries())
      .map(([id, { label, count }]) => ({ id, label, count }))
      .sort(sortDesc),
    industries: Array.from(industries.entries())
      .map(([id, { label, count }]) => ({ id, label, count }))
      .sort(sortDesc),
    employeeBuckets: EMPLOYEE_BUCKETS.map((b) => ({ id: b.id, label: b.label })),
    emailStatuses: Array.from(emailStatuses.entries())
      .map(([id, count]) => ({ id, label: id, count }))
      .sort(sortDesc),
    phoneTypes: Array.from(phoneTypes.entries())
      .map(([id, count]) => ({ id, label: id, count }))
      .sort(sortDesc),
  };
}

export interface LinkedCompany {
  id: string;
  companyName: string | null;
  domain: string | null;
  qualityTier: string | null;
}

export interface PersonDetail {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  email: string | null;
  emailStatus: string | null;
  phone: string | null;
  phoneType: string | null;
  linkedinUrl: string | null;
  sources: string[];
  tags: string[];
  lastUpdated: string | null;
  customData: Record<string, unknown>;
  linkedCompany: LinkedCompany | null;
}

// Additional to the shared blocklist in custom-data.ts — person-specific
// housekeeping fields per the People Detail spec.
const PERSON_EXTRA_BLOCKED_KEYS = [
  "company_linkedin_id",
  "connections_count",
  "apollo_id",
  "pushed_to_clay",
  "created_at",
  "updated_at",
];

export async function getPersonDetail(id: string): Promise<PersonDetail | null> {
  const { data, error } = await supabaseAdmin.from("people").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  let linkedCompany: LinkedCompany | null = null;
  if (data.company_id) {
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id,company_name,domain,quality_tier")
      .eq("id", data.company_id)
      .maybeSingle();
    if (companyError) throw companyError;
    if (company) {
      linkedCompany = {
        id: company.id,
        companyName: company.company_name,
        domain: company.domain,
        qualityTier: company.quality_tier,
      };
    }
  }

  return {
    id: data.id,
    fullName: data.full_name,
    jobTitle: data.job_title,
    email: data.email,
    emailStatus: data.email_status,
    phone: data.phone,
    phoneType: data.phone_type,
    linkedinUrl: data.linkedin_url,
    sources: normalizeSourceTokens(data.source),
    tags: data.tags ?? [],
    lastUpdated: data.last_updated,
    customData: filterCustomData(data.custom_data, PERSON_EXTRA_BLOCKED_KEYS),
    linkedCompany,
  };
}

export { employeeBucketOf };
