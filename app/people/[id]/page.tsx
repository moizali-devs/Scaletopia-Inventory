import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonDetail } from "@/lib/data/people";
import { Masthead } from "@/components/shared/masthead";
import { SprocketRail } from "@/components/shared/sprocket-rail";
import { Perforation } from "@/components/companies/perforation";
import { RecordField } from "@/components/companies/record-field";
import { TagChip } from "@/components/companies/tag-chip";
import { SourceChip } from "@/components/companies/source-chip";
import { EnrichmentList } from "@/components/companies/enrichment-list";
import { EmailStatusBadge } from "@/components/people/email-status-badge";
import { PhoneTypeBadge } from "@/components/people/phone-type-badge";
import { LinkedCompanyCard } from "@/components/people/linked-company-card";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPersonDetail(id);
  if (!person) notFound();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Masthead title="Person Record" generatedAt={new Date()} />

      <div className="flex flex-1 justify-center">
        <SprocketRail className="border-r border-rule" />

        <main className="flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
          <Link
            href="/people"
            className="font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-stamp"
          >
            &lt; Back to ledger
          </Link>

          <section className="relative border border-rule bg-card">
            <Perforation />

            <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
              <div>
                <h1 className="font-mono text-2xl font-semibold uppercase tracking-tight">
                  {person.fullName ?? "Unnamed person"}
                </h1>
                {person.jobTitle && (
                  <p className="font-mono text-sm text-ink-soft">{person.jobTitle}</p>
                )}
              </div>
            </div>

            <div className="grid gap-x-8 border-t border-rule px-6 py-4 md:grid-cols-2">
              <div>
                <RecordField label="Email">
                  <span className="inline-flex items-center gap-2">
                    {person.email ?? "—"}
                    <EmailStatusBadge email={person.email} status={person.emailStatus} />
                  </span>
                </RecordField>
                <RecordField label="Phone">
                  <span className="inline-flex items-center gap-2">
                    {person.phone ?? "—"}
                    <PhoneTypeBadge phone={person.phone} type={person.phoneType} />
                  </span>
                </RecordField>
              </div>
              <div>
                <RecordField label="Last updated">
                  {person.lastUpdated
                    ? new Date(person.lastUpdated).toLocaleDateString("en-US")
                    : "—"}
                </RecordField>
              </div>
            </div>

            {person.linkedinUrl && (
              <div className="flex flex-wrap gap-4 border-t border-rule px-6 py-3 font-mono text-xs">
                <a
                  href={person.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline-offset-2 hover:text-stamp hover:underline"
                >
                  LinkedIn ↗
                </a>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-rule px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Source
              </span>
              {person.sources.length > 0 ? (
                person.sources.map((id) => <SourceChip key={id} id={id} />)
              ) : (
                <span className="text-sm text-ink-soft">—</span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
              Linked company
            </h2>
            <LinkedCompanyCard company={person.linkedCompany} />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {person.tags.length > 0 ? (
                person.tags.map((tag, i) => <TagChip key={`${tag}-${i}`} value={tag} />)
              ) : (
                <span className="font-mono text-xs text-ink-soft">No tags</span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
              Enrichment data
            </h2>
            <EnrichmentList data={person.customData} />
          </section>
        </main>

        <SprocketRail className="border-l border-rule" />
      </div>
    </div>
  );
}
