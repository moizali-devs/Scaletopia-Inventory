import { getCompanyFilterOptions } from "@/lib/data/companies";

export async function GET() {
  const options = await getCompanyFilterOptions();
  return Response.json(options);
}
