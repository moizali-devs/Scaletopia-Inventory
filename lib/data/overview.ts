import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeSourceTokens, sourceLabel } from "@/lib/data/source";
import { fetchAllRows } from "@/lib/data/fetch-all-rows";

export interface BreakdownEntry {
  id: string;
  label: string;
  count: number;
}

export interface Overview {
  totalCompanies: number;
  totalPeople: number;
  niches: BreakdownEntry[];
  sources: BreakdownEntry[];
}

function sortedBreakdown(counts: Map<string, number>, labelOf: (id: string) => string): BreakdownEntry[] {
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, label: labelOf(id), count }))
    .sort((a, b) => b.count - a.count);
}

export async function getOverview(): Promise<Overview> {
  const [companiesCount, peopleCount, companyRows] = await Promise.all([
    supabaseAdmin.from("companies").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("people").select("id", { count: "exact", head: true }),
    fetchAllRows<{ niche: string | null; source: string | null }>(
      "companies",
      "niche,source"
    ),
  ]);

  if (companiesCount.error) throw companiesCount.error;
  if (peopleCount.error) throw peopleCount.error;

  const nicheCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();

  for (const row of companyRows) {
    if (row.niche) {
      nicheCounts.set(row.niche, (nicheCounts.get(row.niche) ?? 0) + 1);
    }
    for (const token of normalizeSourceTokens(row.source)) {
      sourceCounts.set(token, (sourceCounts.get(token) ?? 0) + 1);
    }
  }

  return {
    totalCompanies: companiesCount.count ?? 0,
    totalPeople: peopleCount.count ?? 0,
    niches: sortedBreakdown(nicheCounts, (id) => id),
    sources: sortedBreakdown(sourceCounts, sourceLabel),
  };
}
