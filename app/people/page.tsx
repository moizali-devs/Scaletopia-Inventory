import { getPeople, getPersonFilterOptions } from "@/lib/data/people";
import { parsePersonFilters } from "@/lib/data/people-search-params";
import { parsePage } from "@/lib/data/companies-search-params";
import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { PeopleFilterSlip } from "@/components/people/filter-slip";
import { PeopleTable } from "@/components/people/people-table";
import { ExportButton } from "@/components/people/export-button";
import { Pagination } from "@/components/companies/pagination";

export const revalidate = 3600; // Revalidate every hour

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
    <AppShell>
      <Topbar section="Pages" page="People" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="animate-in animate-in-stagger-1">
            <PeopleFilterSlip options={options} />
          </div>

          <div className="flex items-baseline justify-between gap-3 animate-in animate-in-stagger-2">
            <h2 className="text-sm font-semibold text-ink">
              {result.total.toLocaleString("en-US")} people
            </h2>
            <ExportButton href={exportHref} />
          </div>

          <div className="animate-in animate-in-stagger-3">
            <PeopleTable rows={result.rows} />
          </div>

          <div className="animate-in animate-in-stagger-4">
            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              searchParams={params}
            />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
