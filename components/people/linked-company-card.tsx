import Link from "next/link";
import { QualityBadge } from "@/components/companies/quality-badge";
import type { LinkedCompany } from "@/lib/data/people";

export function LinkedCompanyCard({ company }: { company: LinkedCompany | null }) {
  if (!company) {
    return (
      <div className="border border-dashed border-rule px-5 py-6 text-center font-mono text-xs italic text-ink-soft">
        No linked company
      </div>
    );
  }

  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center justify-between gap-4 border border-rule bg-card px-5 py-4 transition-colors hover:border-ink"
    >
      <div>
        <p className="font-mono text-sm font-semibold text-ink">
          {company.companyName ?? "Unnamed company"}
        </p>
        {company.domain && <p className="font-mono text-xs text-ink-soft">{company.domain}</p>}
      </div>
      <QualityBadge tier={company.qualityTier} />
    </Link>
  );
}
