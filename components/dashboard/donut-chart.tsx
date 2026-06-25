import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--c-primary)",
  "var(--c-blue)",
  "var(--c-green)",
  "var(--c-purple)",
  "var(--c-cyan)",
  "var(--c-indigo)",
];

const R = 38;
const CIRC = 2 * Math.PI * R;

export function DonutChart({
  title,
  entries,
  limit = 5,
}: {
  title: string;
  entries: BreakdownEntry[];
  limit?: number;
}) {
  const top = entries.slice(0, limit);
  const rest = entries.slice(limit).reduce((s, e) => s + e.count, 0);
  const slices = rest > 0 ? [...top, { id: "other", label: "Other", count: rest }] : top;
  const total = slices.reduce((s, e) => s + e.count, 0) || 1;

  const fractions = slices.map((s) => s.count / total);
  const segments = slices.map((s, i) => {
    const before = fractions.slice(0, i).reduce((sum, f) => sum + f, 0);
    return {
      color: COLORS[i % COLORS.length],
      dash: fractions[i] * CIRC,
      // Rotate each arc to start where the previous one ended (degrees, around center).
      rotate: before * 360,
      pct: fractions[i] * 100,
      label: s.label,
      id: s.id,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-ink">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="size-[120px] shrink-0 -rotate-90">
          {segments.map((s) => (
            <circle
              key={s.id}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
              strokeLinecap="butt"
              transform={`rotate(${s.rotate} 50 50)`}
            />
          ))}
        </svg>
        <ul className="flex flex-1 flex-col gap-2.5">
          {segments.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-[13px]">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="min-w-0 flex-1 truncate text-ink">{humanizeSlug(s.label)}</span>
              <span className="font-medium tabular-nums text-ink-soft">{s.pct.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
