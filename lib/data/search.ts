import { supabaseAdmin } from "@/lib/supabase/admin";

export interface SearchHit {
  id: string;
  label: string;
  sublabel: string | null;
}

export interface SearchResults {
  companies: SearchHit[];
  people: SearchHit[];
}

const RESULT_LIMIT = 5;

/** Quick autocomplete for the command palette — direct limited queries, not
 * `fetchAllRows` (which fetches the entire matching set; wrong tool for a
 * five-result dropdown). */
export async function searchRecords(term: string): Promise<SearchResults> {
  const cleaned = term.trim().replace(/[%,]/g, "");
  if (!cleaned) return { companies: [], people: [] };

  const [companiesRes, peopleRes] = await Promise.all([
    supabaseAdmin
      .from("companies")
      .select("id,company_name,domain")
      .or(`company_name.ilike.%${cleaned}%,domain.ilike.%${cleaned}%`)
      .limit(RESULT_LIMIT),
    supabaseAdmin
      .from("people")
      .select("id,full_name,email")
      .or(`full_name.ilike.%${cleaned}%,email.ilike.%${cleaned}%`)
      .limit(RESULT_LIMIT),
  ]);

  if (companiesRes.error) throw companiesRes.error;
  if (peopleRes.error) throw peopleRes.error;

  return {
    companies: (companiesRes.data ?? []).map((c) => ({
      id: String(c.id),
      label: c.company_name ?? "Unnamed company",
      sublabel: c.domain,
    })),
    people: (peopleRes.data ?? []).map((p) => ({
      id: String(p.id),
      label: p.full_name ?? "Unnamed person",
      sublabel: p.email,
    })),
  };
}
