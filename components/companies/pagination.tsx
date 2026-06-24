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
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 font-mono text-[11px] text-ink-soft">
      <span>
        SHOWING {start.toLocaleString("en-US")}–{end.toLocaleString("en-US")} OF{" "}
        {total.toLocaleString("en-US")} companies on record.
      </span>
      <nav className="flex items-center gap-3">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
          &lt; PREV
        </PageLink>
        <span className="tabular-nums">
          PAGE {page} / {lastPage}
        </span>
        <PageLink href={hrefFor(page + 1)} disabled={page >= lastPage}>
          NEXT &gt;
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
    return <span className="cursor-not-allowed text-ink-soft/40">{children}</span>;
  }
  return (
    <Link href={href} scroll={false} className={cn("text-ink hover:text-stamp")}>
      {children}
    </Link>
  );
}
