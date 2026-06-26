import type { NextRequest } from "next/server";
import { getCompanies } from "@/lib/data/companies";
import { parseCompanyFilters, parsePage } from "@/lib/data/companies-search-params";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parseCompanyFilters(params);
  const page = parsePage(params);
  const result = await getCompanies(filters, page, PAGE_SIZE);
  return Response.json(result);
}
