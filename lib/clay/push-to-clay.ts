import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAllFilteredCompanies, type CompanyListFilters } from "@/lib/data/companies";

export const CLAY_CONCURRENCY = 8;
export const MARK_CHUNK = 200;
export const IN_CHUNK = 200;
export const WEBHOOK_RETRIES = 1;
export const FAILED_PREVIEW = 20;

export interface ClayPushProgress {
  phase: "resolving" | "pushing" | "done";
  done: number;
  total: number;
  pushed: number;
  errors: number;
}

export interface ClayPushResult {
  total_matched: number;
  already_pushed: number;
  total_found: number;
  pushed: number;
  errors: number;
  failed_companies: string[];
}

export interface RunClayPushDeps {
  fetchImpl?: typeof fetch;
  onProgress?: (p: ClayPushProgress) => void;
}

const PAYLOAD_COLUMNS =
  "id,company_name,domain,website_url,linkedin_url,industry,city,state,country,employee_count,phone,description,founded_year,revenue,source,quality_tier,mx_provider,security_gateway,keywords,technologies,pushed_to_clay";

interface EligibleRow {
  id: string;
  company_name: string | null;
  domain: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employee_count: number | null;
  phone: string | null;
  description: string | null;
  founded_year: number | null;
  revenue: number | null;
  source: string | null;
  quality_tier: string | null;
  mx_provider: string | null;
  security_gateway: string | null;
  keywords: string[] | null;
  technologies: string[] | null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Fresh (uncached) fetch of the eligible rows for a set of matched ids.
 * `getAllFilteredCompanies` is backed by a 1-hour TTL cache and doesn't even
 * select `pushed_to_clay`, so pushed-status must always be resolved here,
 * at execution time, against the live table. */
async function fetchEligibleRows(matchedIds: string[]): Promise<EligibleRow[]> {
  const rows: EligibleRow[] = [];
  for (const idChunk of chunk(matchedIds, IN_CHUNK)) {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select(PAYLOAD_COLUMNS)
      .in("id", idChunk)
      .not("pushed_to_clay", "is", true);
    if (error) throw error;
    if (data) rows.push(...(data as unknown as EligibleRow[]));
  }
  return rows;
}

function toWebhookPayload(row: EligibleRow) {
  return {
    company_id: row.id,
    company_name: row.company_name,
    domain: row.domain,
    website_url: row.website_url,
    linkedin_url: row.linkedin_url,
    industry: row.industry,
    city: row.city,
    state: row.state,
    country: row.country,
    employee_count: row.employee_count,
    phone: row.phone,
    description: row.description,
    founded_year: row.founded_year,
    revenue: row.revenue,
    source: row.source,
    quality_tier: row.quality_tier,
    mx_provider: row.mx_provider,
    security_gateway: row.security_gateway,
    keywords: row.keywords,
    technologies: row.technologies,
  };
}

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

async function postWithRetry(
  fetchImpl: typeof fetch,
  webhookUrl: string,
  row: EligibleRow
): Promise<boolean> {
  const body = JSON.stringify(toWebhookPayload(row));
  for (let attempt = 0; attempt <= WEBHOOK_RETRIES; attempt++) {
    try {
      const resp = await fetchImpl(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (resp.ok) return true;
      if (!TRANSIENT_STATUSES.has(resp.status)) return false;
    } catch {
      // transient (network) failure — fall through to retry/backoff
    }
    if (attempt < WEBHOOK_RETRIES) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

async function markPushed(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const nowIso = new Date().toISOString();
  for (const idChunk of chunk(ids, MARK_CHUNK)) {
    const { error } = await supabaseAdmin
      .from("companies")
      .update({ pushed_to_clay: true, pushed_to_clay_at: nowIso, last_updated: nowIso })
      .in("id", idChunk)
      .not("pushed_to_clay", "is", true);
    if (error) throw error;
  }
}

/** Resolve-only, cheap: used by the preflight route for the confirm dialog. */
export async function resolveClayPushCounts(
  filters: CompanyListFilters
): Promise<{ total_matched: number; eligible: number }> {
  const matched = await getAllFilteredCompanies(filters);
  const total_matched = matched.length;
  if (total_matched === 0) return { total_matched: 0, eligible: 0 };

  const eligible = await fetchEligibleRows(matched.map((c) => c.id));
  return { total_matched, eligible: eligible.length };
}

/** The whole feature. Reads process.env.CLAY_WEBHOOK_URL. */
export async function runClayPush(
  filters: CompanyListFilters,
  deps: RunClayPushDeps = {}
): Promise<ClayPushResult> {
  const webhookUrl = process.env.CLAY_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("CLAY_WEBHOOK_URL is not configured");
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const onProgress = deps.onProgress;

  onProgress?.({ phase: "resolving", done: 0, total: 0, pushed: 0, errors: 0 });

  const matched = await getAllFilteredCompanies(filters);
  const total_matched = matched.length;

  if (total_matched === 0) {
    onProgress?.({ phase: "done", done: 0, total: 0, pushed: 0, errors: 0 });
    return {
      total_matched: 0,
      already_pushed: 0,
      total_found: 0,
      pushed: 0,
      errors: 0,
      failed_companies: [],
    };
  }

  const eligible = await fetchEligibleRows(matched.map((c) => c.id));
  const already_pushed = total_matched - eligible.length;
  const total_found = eligible.length;

  onProgress?.({ phase: "pushing", done: 0, total: total_found, pushed: 0, errors: 0 });

  let pushed = 0;
  let errors = 0;
  let done = 0;
  const failed_companies: string[] = [];
  let pendingMarkIds: string[] = [];

  for (const group of chunk(eligible, CLAY_CONCURRENCY)) {
    const results = await Promise.allSettled(
      group.map(async (row) => ({
        row,
        ok: await postWithRetry(fetchImpl, webhookUrl, row),
      }))
    );

    for (const result of results) {
      done++;
      if (result.status === "fulfilled" && result.value.ok) {
        pushed++;
        pendingMarkIds.push(result.value.row.id);
      } else {
        errors++;
        const name =
          result.status === "fulfilled" ? result.value.row.company_name : null;
        if (failed_companies.length < FAILED_PREVIEW) {
          failed_companies.push(name || "unknown");
        }
      }
    }

    if (pendingMarkIds.length >= MARK_CHUNK) {
      await markPushed(pendingMarkIds);
      pendingMarkIds = [];
    }

    onProgress?.({ phase: "pushing", done, total: total_found, pushed, errors });
  }

  await markPushed(pendingMarkIds);

  onProgress?.({ phase: "done", done, total: total_found, pushed, errors });

  return { total_matched, already_pushed, total_found, pushed, errors, failed_companies };
}
