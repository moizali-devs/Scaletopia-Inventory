import { getOverview } from "@/lib/data/overview";
import { Masthead } from "@/components/shared/masthead";
import { Tally } from "@/components/overview/tally";
import { ManifestList } from "@/components/overview/manifest-list";
import { SprocketRail } from "@/components/shared/sprocket-rail";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const overview = await getOverview();
  const generatedAt = new Date();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Masthead title="Inventory Manifest" generatedAt={generatedAt} />

      <div className="flex flex-1 justify-center">
        <SprocketRail className="border-r border-rule" />

        <main className="flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 md:px-10">
          <section className="flex flex-col gap-4 sm:flex-row">
            <Tally label="Total companies on file" value={overview.totalCompanies} />
            <Tally label="Total people on file" value={overview.totalPeople} />
          </section>

          <section className="flex flex-col gap-6 md:flex-row">
            <ManifestList
              title="Niche breakdown"
              caption="companies per niche, desc."
              entries={overview.niches}
            />
            <ManifestList
              title="Source breakdown"
              caption="companies per provider, desc."
              entries={overview.sources}
            />
          </section>

          <footer className="border-t border-rule pt-4 font-mono text-[11px] text-ink-soft">
            END OF MANIFEST — {overview.niches.length} niches,{" "}
            {overview.sources.length} sources,{" "}
            {overview.totalCompanies.toLocaleString("en-US")} companies on record.
          </footer>
        </main>

        <SprocketRail className="border-l border-rule" />
      </div>
    </div>
  );
}
