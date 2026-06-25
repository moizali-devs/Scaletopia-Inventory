import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MiniBarList({
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
        <ul className="flex flex-1 flex-col justify-between gap-4">
          {top.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 text-[13px]">
              <span className="w-20 shrink-0 truncate text-ink">{humanizeSlug(entry.label)}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-c-track">
                <span
                  className="block h-full rounded-full bg-c-primary"
                  style={{ width: `${Math.max(4, (entry.count / max) * 100)}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
