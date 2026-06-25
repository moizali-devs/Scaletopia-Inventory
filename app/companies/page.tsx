import { getCompanies, getCompanyFilterOptions } from "@/lib/data/companies";
import { parseCompanyFilters, parsePage } from "@/lib/data/companies-search-params";
import { AppShell } from "@/components/dashboard/app-shell";
import { Topbar } from "@/components/dashboard/topbar";
import { FilterSlip } from "@/components/companies/filter-slip";
import { CompaniesTable } from "@/components/companies/companies-table";
import { ExportButton } from "@/components/companies/export-button";
import { Pagination } from "@/components/companies/pagination";

export const revalidate = 3600; // Revalidate every hour

const PAGE_SIZE = 50;

export default async function CompaniesPage({
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

  const filters = parseCompanyFilters(params);
  const page = parsePage(params);

  const [options, result] = await Promise.all([
    getCompanyFilterOptions(),
    getCompanies(filters, page, PAGE_SIZE),
  ]);

  const exportHref = `/companies/export?${params.toString()}`;

  return (
    <AppShell>
      <Topbar section="Pages" page="Companies" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-7">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <FilterSlip options={options} />

          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              {result.total.toLocaleString("en-US")} companies
            </h2>
            <ExportButton href={exportHref} />
          </div>

          <CompaniesTable rows={result.rows} />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            searchParams={params}
          />
        </div>
      </main>
    </AppShell>
  );
}
