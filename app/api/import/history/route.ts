import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const IMPORT_TOKEN = "scaletopia-import-2026";

export async function GET(req: Request) {
  const token = req.headers.get("X-Import-Token");
  if (token !== IMPORT_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: history, error: historyErr } = await supabaseAdmin
    .from("import_history")
    .select("*")
    .order("completed_at", { ascending: false })
    .limit(50);

  if (historyErr) {
    return Response.json({ error: historyErr.message }, { status: 500 });
  }

  if (!history || history.length === 0) {
    return Response.json([]);
  }

  // Look up display names from provider_mappings
  const sourceKeys = [...new Set(history.map((r) => r.source_key))];
  const { data: mappings } = await supabaseAdmin
    .from("import_provider_mappings")
    .select("source_key, display_name")
    .in("source_key", sourceKeys);

  const displayNameMap: Record<string, string> = {};
  for (const m of mappings ?? []) {
    displayNameMap[m.source_key] = m.display_name;
  }

  const rows = history.map((r) => ({
    ...r,
    display_name: displayNameMap[r.source_key] ?? r.source_key,
  }));

  return Response.json(rows);
}
