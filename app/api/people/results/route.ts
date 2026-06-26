import type { NextRequest } from "next/server";
import { getPeople } from "@/lib/data/people";
import { parsePersonFilters } from "@/lib/data/people-search-params";
import { parsePage } from "@/lib/data/companies-search-params";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parsePersonFilters(params);
  const page = parsePage(params);
  const result = await getPeople(filters, page, PAGE_SIZE);
  return Response.json(result);
}
