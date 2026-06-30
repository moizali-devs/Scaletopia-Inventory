import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sourceKey = request.nextUrl.searchParams.get("sourceKey");

  if (!sourceKey) {
    const { data, error } = await supabaseAdmin
      .from("import_provider_mappings")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data ?? []);
  }

  const { data, error } = await supabaseAdmin
    .from("import_provider_mappings")
    .select("*")
    .eq("source_key", sourceKey)
    .single();

  if (error && error.code !== "PGRST116") {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? null);
}

export async function POST(request: NextRequest) {
  let body: {
    sourceKey: string;
    displayName?: string;
    targetTable?: string;
    columnMap: Record<string, string>;
    lastUsedClient?: string;
    lastUsedNiche?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sourceKey, displayName, targetTable, columnMap, lastUsedClient, lastUsedNiche } = body;

  if (!sourceKey || !columnMap) {
    return Response.json({ error: "sourceKey and columnMap required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("import_provider_mappings")
    .upsert(
      {
        source_key: sourceKey,
        display_name: displayName ?? sourceKey,
        target_table: targetTable ?? "companies",
        column_map: columnMap,
        last_used_client: lastUsedClient ?? null,
        last_used_niche: lastUsedNiche ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "source_key" }
    )
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id: data?.id });
}
