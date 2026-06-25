import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  searchParams: URLSearchParams;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  }

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-sm text-ink-soft">
      <span className="font-mono text-xs tabular-nums">
        {start.toLocaleString("en-US")}–{end.toLocaleString("en-US")} of{" "}
        {total.toLocaleString("en-US")}
      </span>
      <nav className="flex items-center gap-3">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
          Prev
        </PageLink>
        <span className="font-mono text-xs tabular-nums">
          {page} / {lastPage}
        </span>
        <PageLink href={hrefFor(page + 1)} disabled={page >= lastPage}>
          Next
        </PageLink>
      </nav>
    </footer>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md px-2.5 py-1 text-ink-soft/40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={cn("rounded-md px-2.5 py-1 text-ink transition-colors hover:bg-rule/30")}
    >
      {children}
    </Link>
  );
}
