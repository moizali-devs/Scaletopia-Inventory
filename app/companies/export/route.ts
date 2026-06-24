import type { NextRequest } from "next/server";
import { exportCompaniesCsv } from "@/lib/data/companies-csv";
import { parseCompanyFilters } from "@/lib/data/companies-search-params";

export async function GET(request: NextRequest) {
  const filters = parseCompanyFilters(request.nextUrl.searchParams);
  const csv = await exportCompaniesCsv(filters);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="companies.csv"',
    },
  });
}
