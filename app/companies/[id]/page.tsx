import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyDetail } from "@/lib/data/companies";
import { Masthead } from "@/components/shared/masthead";
import { SprocketRail } from "@/components/shared/sprocket-rail";
import { Perforation } from "@/components/companies/perforation";
import { RecordField } from "@/components/companies/record-field";
import { TagChip } from "@/components/companies/tag-chip";
import { SourceChip } from "@/components/companies/source-chip";
import { QualityBadge } from "@/components/companies/quality-badge";
import { EnrichmentList } from "@/components/companies/enrichment-list";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyDetail(id);
  if (!company) notFound();

  const location = [company.city, company.state, company.country].filter(Boolean).join(", ");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Masthead title="Company Record" generatedAt={new Date()} />

      <div className="flex flex-1 justify-center">
        <SprocketRail className="border-r border-rule" />

        <main className="flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
          <Link
            href="/companies"
            className="font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-stamp"
          >
            &lt; Back to ledger
          </Link>

          <section className="relative border border-rule bg-card">
            <Perforation />

            <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
              <div>
                <h1 className="font-mono text-2xl font-semibold uppercase tracking-tight">
                  {company.companyName ?? "Unnamed company"}
                </h1>
                {company.domain && (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-ink-soft hover:text-stamp"
                  >
                    {company.domain}
                  </a>
                )}
              </div>
              <div className="rotate-[-6deg]">
                <QualityBadge tier={company.qualityTier} />
              </div>
            </div>

            <div className="grid gap-x-8 border-t border-rule px-6 py-4 md:grid-cols-2">
              <div>
                <RecordField label="Industry">{company.industry ?? "—"}</RecordField>
                <RecordField label="Employees">
                  {company.employeeCount?.toLocaleString("en-US") ?? "—"}
                </RecordField>
                <RecordField label="Location">{location || "—"}</RecordField>
                <RecordField label="Phone">{company.phone ?? "—"}</RecordField>
                <RecordField label="Founded">{company.foundedYear ?? "—"}</RecordField>
                <RecordField label="Revenue">
                  {company.revenue ? `$${company.revenue.toLocaleString("en-US")}` : "—"}
                </RecordField>
              </div>
              <div>
                <RecordField label="Niche">{company.niche ?? "—"}</RecordField>
                <RecordField label="Client">{company.client ?? "—"}</RecordField>
                <RecordField label="Domain status">{company.domainStatus ?? "—"}</RecordField>
                <RecordField label="MX provider">{company.mxProvider ?? "—"}</RecordField>
                <RecordField label="Security gateway">{company.securityGateway ?? "—"}</RecordField>
                <RecordField label="Last updated">
                  {company.lastUpdated
                    ? new Date(company.lastUpdated).toLocaleDateString("en-US")
                    : "—"}
                </RecordField>
              </div>
            </div>

            {(company.linkedinUrl || company.websiteUrl) && (
              <div className="flex flex-wrap gap-4 border-t border-rule px-6 py-3 font-mono text-xs">
                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline-offset-2 hover:text-stamp hover:underline"
                  >
                    Website ↗
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline-offset-2 hover:text-stamp hover:underline"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-rule px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Source
              </span>
              {company.sources.length > 0 ? (
                company.sources.map((id) => <SourceChip key={id} id={id} />)
              ) : (
                <span className="text-sm text-ink-soft">—</span>
              )}
            </div>

            {company.description && (
              <p className="border-t border-rule px-6 py-4 text-sm leading-relaxed text-ink">
                {company.description}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {company.tags.length > 0 ? (
                company.tags.map((tag, i) => <TagChip key={`${tag}-${i}`} value={tag} />)
              ) : (
                <span className="font-mono text-xs text-ink-soft">No tags</span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
              Enrichment data
            </h2>
            <EnrichmentList data={company.customData} />
          </section>
        </main>

        <SprocketRail className="border-l border-rule" />
      </div>
    </div>
  );
}
