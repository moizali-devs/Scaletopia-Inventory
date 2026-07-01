import type { NextRequest } from "next/server";
import { parseCompanyFilters } from "@/lib/data/companies-search-params";
import { resolveClayPushCounts } from "@/lib/clay/push-to-clay";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const filters = parseCompanyFilters(request.nextUrl.searchParams);
  const { total_matched, eligible } = await resolveClayPushCounts(filters);
  return Response.json({ total_matched, eligible });
}
