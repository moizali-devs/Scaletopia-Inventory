import type { CompanyListFilters, CompanyListRow } from "@/lib/data/companies";
import { getAllFilteredCompanies } from "@/lib/data/companies";

const HEADERS = [
  "Company Name",
  "Domain",
  "Industry",
  "Employees",
  "Location",
  "Source",
  "Quality Tier",
  "Last Updated",
];

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function locationOf(row: CompanyListRow): string {
  return [row.city, row.country].filter(Boolean).join(", ");
}

function toCsvRow(row: CompanyListRow): string {
  return [
    row.companyName ?? "",
    row.domain ?? "",
    row.industry ?? "",
    row.employeeCount?.toString() ?? "",
    locationOf(row),
    row.sources.join(", "),
    row.qualityTier ?? "",
    row.lastUpdated ?? "",
  ]
    .map(csvCell)
    .join(",");
}

export async function exportCompaniesCsv(filters: CompanyListFilters): Promise<string> {
  const rows = await getAllFilteredCompanies(filters);
  return [HEADERS.join(","), ...rows.map(toCsvRow)].join("\n");
}
