import type { NextRequest } from "next/server";
import { exportPeopleCsv } from "@/lib/data/people-csv";
import { parsePersonFilters } from "@/lib/data/people-search-params";

export async function GET(request: NextRequest) {
  const filters = parsePersonFilters(request.nextUrl.searchParams);
  const csv = await exportPeopleCsv(filters);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="people.csv"',
    },
  });
}
