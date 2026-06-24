import { getPeople, getPersonFilterOptions } from "@/lib/data/people";
import { parsePersonFilters } from "@/lib/data/people-search-params";
import { parsePage } from "@/lib/data/companies-search-params";
import { Masthead } from "@/components/shared/masthead";
import { SprocketRail } from "@/components/shared/sprocket-rail";
import { PeopleFilterSlip } from "@/components/people/filter-slip";
import { PeopleTable } from "@/components/people/people-table";
import { Pagination } from "@/components/companies/pagination";
import { Perforation } from "@/components/companies/perforation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (value !== undefined) params.append(key, value);
  }

  const filters = parsePersonFilters(params);
  const page = parsePage(params);

  const [options, result] = await Promise.all([
    getPersonFilterOptions(),
    getPeople(filters, page, PAGE_SIZE),
  ]);

  const exportHref = `/people/export?${params.toString()}`;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Masthead title="People Ledger" generatedAt={new Date()} />

      <div className="flex flex-1 justify-center">
        <SprocketRail className="border-r border-rule" />

        <main className="flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
          <PeopleFilterSlip options={options} />

          <Perforation />

          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
              Manifest — {result.total.toLocaleString("en-US")} people
            </h2>
            <a
              href={exportHref}
              className="border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Export CSV
            </a>
          </div>

          <PeopleTable rows={result.rows} />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            searchParams={params}
          />
        </main>

        <SprocketRail className="border-l border-rule" />
      </div>
    </div>
  );
}
