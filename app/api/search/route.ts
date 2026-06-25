import type { NextRequest } from "next/server";
import { searchRecords } from "@/lib/data/search";

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchRecords(term);
  return Response.json(results);
}
