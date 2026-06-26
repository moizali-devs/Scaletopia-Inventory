import type { CompanyListFilters, CompanyListRow } from "@/lib/data/companies";
import { getAllFilteredCompanies } from "@/lib/data/companies";

const HEADERS = [
  "Company Name",
  "Domain",
  "Website URL",
  "LinkedIn URL",
  "Niche",
  "Industry",
  "Employees",
  "City",
  "State",
  "Country",
  "Phone",
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

function toCsvRow(row: CompanyListRow): string {
  return [
    row.companyName ?? "",
    row.domain ?? "",
    row.websiteUrl ?? "",
    row.linkedinUrl ?? "",
    row.niche ?? "",
    row.industry ?? "",
    row.employeeCount?.toString() ?? "",
    row.city ?? "",
    row.state ?? "",
    row.country ?? "",
    row.phone ?? "",
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
