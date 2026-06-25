import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CompanyListRow } from "@/lib/data/companies";
import { SourceChip } from "@/components/companies/source-chip";
import { QualityBadge } from "@/components/companies/quality-badge";

function formatLastUpdated(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function locationOf(row: CompanyListRow): string {
  return [row.city, row.country].filter(Boolean).join(", ") || "—";
}

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

export function CompaniesTable({ rows }: { rows: CompanyListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-rule bg-card px-6 py-12 text-center text-sm text-ink-soft">
        No companies match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule bg-card">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-ink-soft"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="group border-b border-rule last:border-0">
              <td className="p-0">
                <Link
                  href={`/companies/${row.id}`}
                  className="block px-3 py-2.5 font-medium text-ink group-hover:bg-rule/30"
                >
                  {row.companyName ?? "—"}
                </Link>
              </td>
              <CompanyCell href={`/companies/${row.id}`}>{row.domain ?? "—"}</CompanyCell>
              <CompanyCell href={`/companies/${row.id}`}>{row.industry ?? "—"}</CompanyCell>
              <CompanyCell href={`/companies/${row.id}`} mono>
                {row.employeeCount?.toLocaleString("en-US") ?? "—"}
              </CompanyCell>
              <CompanyCell href={`/companies/${row.id}`}>{locationOf(row)}</CompanyCell>
              <td className="p-0">
                <Link
                  href={`/companies/${row.id}`}
                  className="flex flex-wrap gap-1 px-3 py-2.5 group-hover:bg-rule/30"
                >
                  {row.sources.length > 0
                    ? row.sources.map((id) => <SourceChip key={id} id={id} />)
                    : "—"}
                </Link>
              </td>
              <td className="p-0">
                <Link
                  href={`/companies/${row.id}`}
                  className="block px-3 py-2.5 group-hover:bg-rule/30"
                >
                  <QualityBadge tier={row.qualityTier} />
                </Link>
              </td>
              <CompanyCell href={`/companies/${row.id}`} mono>
                {formatLastUpdated(row.lastUpdated)}
              </CompanyCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompanyCell({
  href,
  mono,
  children,
}: {
  href: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <td className="p-0">
      <Link
        href={href}
        className={cn(
          "block whitespace-nowrap px-3 py-2.5 text-ink group-hover:bg-rule/30",
          mono && "font-mono tabular-nums"
        )}
      >
        {children}
      </Link>
    </td>
  );
}
