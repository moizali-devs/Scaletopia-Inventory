import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PersonListRow } from "@/lib/data/people";
import { SourceChip } from "@/components/companies/source-chip";
import { EmailStatusBadge } from "@/components/people/email-status-badge";
import { PhoneTypeBadge } from "@/components/people/phone-type-badge";

function formatLastUpdated(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const HEADERS = [
  "Full Name",
  "Job Title",
  "Email",
  "Phone",
  "Company",
  "Country",
  "Source",
  "Last Updated",
];

export function PeopleTable({ rows }: { rows: PersonListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-rule bg-card px-6 py-12 text-center font-mono text-sm text-ink-soft">
        No people match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-rule">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="bg-ink text-paper">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={cn(i % 2 === 1 && "bg-greenbar/60")}>
              <td className="p-0">
                <Link
                  href={`/people/${row.id}`}
                  className="block px-3 py-2.5 font-medium text-ink hover:bg-greenbar-strong"
                >
                  {row.fullName ?? "—"}
                </Link>
              </td>
              <PersonCell href={`/people/${row.id}`}>{row.jobTitle ?? "—"}</PersonCell>
              <td className="p-0">
                <Link
                  href={`/people/${row.id}`}
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-2.5 hover:bg-greenbar-strong"
                >
                  <span className="text-ink">{row.email ?? "—"}</span>
                  <EmailStatusBadge email={row.email} status={row.emailStatus} />
                </Link>
              </td>
              <td className="p-0">
                <Link
                  href={`/people/${row.id}`}
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-2.5 hover:bg-greenbar-strong"
                >
                  <span className="text-ink">{row.phone ?? "—"}</span>
                  <PhoneTypeBadge phone={row.phone} type={row.phoneType} />
                </Link>
              </td>
              <PersonCell href={`/people/${row.id}`}>{row.companyName ?? "—"}</PersonCell>
              <PersonCell href={`/people/${row.id}`}>{row.country ?? "—"}</PersonCell>
              <td className="p-0">
                <Link
                  href={`/people/${row.id}`}
                  className="flex flex-wrap gap-1 px-3 py-2.5 hover:bg-greenbar-strong"
                >
                  {row.sources.length > 0
                    ? row.sources.map((id) => <SourceChip key={id} id={id} />)
                    : "—"}
                </Link>
              </td>
              <PersonCell href={`/people/${row.id}`} mono>
                {formatLastUpdated(row.lastUpdated)}
              </PersonCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PersonCell({
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
          "block whitespace-nowrap px-3 py-2.5 text-ink hover:bg-greenbar-strong",
          mono && "font-mono tabular-nums"
        )}
      >
        {children}
      </Link>
    </td>
  );
}
