import { getPersonFilterOptions } from "@/lib/data/people";

export async function GET() {
  const options = await getPersonFilterOptions();
  return Response.json(options);
}
