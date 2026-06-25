import type { PersonListFilters, PersonListRow } from "@/lib/data/people";
import { getAllFilteredPeople } from "@/lib/data/people";

const HEADERS = [
  "Full Name",
  "Job Title",
  "Email",
  "Email Status",
  "Phone",
  "Phone Type",
  "Company",
  "City",
  "State",
  "Country",
  "Source",
  "Last Updated",
];

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(row: PersonListRow): string {
  return [
    row.fullName ?? "",
    row.jobTitle ?? "",
    row.email ?? "",
    row.emailStatus ?? "",
    row.phone ?? "",
    row.phoneType ?? "",
    row.companyName ?? "",
    row.city ?? "",
    row.state ?? "",
    row.country ?? "",
    row.sources.join(", "),
    row.lastUpdated ?? "",
  ]
    .map(csvCell)
    .join(",");
}

export async function exportPeopleCsv(filters: PersonListFilters): Promise<string> {
  const rows = await getAllFilteredPeople(filters);
  return [HEADERS.join(","), ...rows.map(toCsvRow)].join("\n");
}
