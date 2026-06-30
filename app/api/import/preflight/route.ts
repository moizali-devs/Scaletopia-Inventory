import "server-only";
import type { NextRequest } from "next/server";
import { preflightRecords } from "@/lib/import/push";
import { normalizeDomain, normalizeLinkedInUrl, scrubJunkDomain } from "@/lib/import/normalize";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: {
    domains: string[];
    linkedins: string[];
    rowCount: number;
    targetTable: "companies" | "people";
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domains, linkedins, rowCount, targetTable } = body;

  if (!Array.isArray(domains) || !Array.isArray(linkedins) || typeof rowCount !== "number" || !targetTable) {
    return Response.json(
      { error: "domains, linkedins, rowCount, and targetTable are required" },
      { status: 400 }
    );
  }

  // Normalize and dedupe domains
  const normalizedDomains = [
    ...new Set(
      domains
        .map((d) => scrubJunkDomain(normalizeDomain(d)))
        .filter((d): d is string => d !== null)
    ),
  ];

  // Normalize and dedupe linkedins
  const normalizedLinkedins = [
    ...new Set(
      linkedins
        .map((l) => normalizeLinkedInUrl(l))
        .filter((l): l is string => l !== null)
    ),
  ];

  // Build minimal record objects for Supabase lookup
  const records: Record<string, unknown>[] = [
    ...normalizedDomains.map((d) => ({ domain: d })),
    ...normalizedLinkedins.map((l) => ({ linkedin_url: l })),
  ];

  if (records.length === 0) {
    return Response.json({
      inputCount: rowCount,
      dedupedCount: 0,
      insertCount: 0,
      updateCount: 0,
    });
  }

  try {
    const result = await preflightRecords(records, targetTable);
    // Override inputCount with the true row count from the client
    return Response.json({ ...result, inputCount: rowCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preflight failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
