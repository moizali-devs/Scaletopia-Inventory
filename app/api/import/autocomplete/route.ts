import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const [mappingsResult, historyResult, companiesResult] = await Promise.all([
    supabaseAdmin.from("import_provider_mappings").select("last_used_client, last_used_niche"),
    supabaseAdmin.from("import_history").select("tags"),
    supabaseAdmin.from("companies").select("client, niche").not("client", "is", null),
  ]);

  const clients = new Set<string>();
  const niches = new Set<string>();

  for (const row of mappingsResult.data ?? []) {
    if (row.last_used_client) clients.add(row.last_used_client);
    if (row.last_used_niche) niches.add(row.last_used_niche);
  }

  for (const row of historyResult.data ?? []) {
    if (Array.isArray(row.tags)) {
      if (row.tags[0]) clients.add(row.tags[0]);
      if (row.tags[1]) niches.add(row.tags[1]);
    }
  }

  for (const row of companiesResult.data ?? []) {
    if (row.client) clients.add(row.client);
    if (row.niche) niches.add(row.niche);
  }

  return Response.json({
    clients: Array.from(clients).sort(),
    niches: Array.from(niches).sort(),
  });
}
