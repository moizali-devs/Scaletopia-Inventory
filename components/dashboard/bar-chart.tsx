import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--c-cyan)",
  "var(--c-primary)",
  "var(--c-blue)",
  "var(--c-purple)",
  "var(--c-green)",
  "var(--c-indigo)",
];

function compact(n: number): string {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function BarChart({
  title,
  entries,
  limit = 6,
}: {
  title: string;
  entries: BreakdownEntry[];
  limit?: number;
}) {
  const top = entries.slice(0, limit);
  const max = Math.max(1, ...top.map((e) => e.count));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-ink">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-1 items-end gap-3 sm:gap-4">
          {top.map((entry, i) => {
            const heightPct = Math.max(4, (entry.count / max) * 100);
            return (
              <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative h-[150px] w-full" title={`${entry.count.toLocaleString("en-US")}`}>
                  <div
                    className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[28px] rounded-lg"
                    style={{ height: `${heightPct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="w-full truncate text-center text-[11px] text-ink-soft">
                  {humanizeSlug(entry.label)}
                </span>
                <span className="text-[10px] font-medium tabular-nums text-ink-mute">
                  {compact(entry.count)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
