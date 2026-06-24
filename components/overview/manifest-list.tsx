import { cn, humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/overview";

export function ManifestList({
  title,
  caption,
  entries,
}: {
  title: string;
  caption: string;
  entries: BreakdownEntry[];
}) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <section className="flex-1 border border-rule bg-card">
      <div className="flex flex-col gap-0.5 border-b border-rule px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">
          {title}
        </h2>
        <p className="whitespace-nowrap font-mono text-[11px] text-ink-soft">{caption}</p>
      </div>
      <ol>
        {entries.map((entry, i) => {
          const rank = i + 1;
          const pct = total > 0 ? (entry.count / total) * 100 : 0;
          return (
            <li
              key={entry.id}
              className={cn(
                "flex items-baseline gap-3 px-5 py-2.5",
                i % 2 === 1 && "bg-greenbar/60"
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  rank === 1 ? "font-semibold text-stamp" : "text-ink-soft"
                )}
              >
                {String(rank).padStart(2, "0")}
              </span>
              <span className="truncate text-sm">{humanizeSlug(entry.label)}</span>
              <span
                aria-hidden
                className="flex-1 self-end border-b border-dotted border-rule"
                style={{ marginBottom: "0.3em" }}
              />
              <span className="font-mono text-sm tabular-nums">
                {entry.count.toLocaleString("en-US")}
              </span>
              <span className="hidden w-12 shrink-0 text-right font-mono text-[11px] text-ink-soft sm:inline">
                {pct.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
