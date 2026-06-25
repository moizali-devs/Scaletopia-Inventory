import Link from "next/link";
import { QualityBadge } from "@/components/companies/quality-badge";
import type { LinkedCompany } from "@/lib/data/people";

export function LinkedCompanyCard({ company }: { company: LinkedCompany | null }) {
  if (!company) {
    return (
      <div className="rounded-lg border border-dashed border-rule px-5 py-6 text-center text-sm italic text-ink-soft">
        No linked company
      </div>
    );
  }

  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-rule bg-card px-5 py-4 transition-colors hover:border-ink-soft"
    >
      <div>
        <p className="text-sm font-semibold text-ink">
          {company.companyName ?? "Unnamed company"}
        </p>
        {company.domain && <p className="text-xs text-ink-soft">{company.domain}</p>}
      </div>
      <QualityBadge tier={company.qualityTier} />
    </Link>
  );
}
