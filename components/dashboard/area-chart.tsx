"use client";

import { useId, useState } from "react";
import { cn, humanizeSlug } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ChartPoint {
  label: string;
  count: number;
}
export interface ChartSeries {
  key: string;
  label: string;
  points: ChartPoint[];
}

function coords(points: ChartPoint[]) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const n = points.length;
  return points.map((p, i) => ({
    x: n <= 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - (p.count / max) * 88 - 6, // pad top/bottom
    point: p,
  }));
}

/** Smooth (Catmull-Rom → cubic bezier) path through the points. */
function smoothPath(pts: { x: number; y: number }[], close: boolean) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  if (close) d += ` L 100 100 L 0 100 Z`;
  return d;
}

export function AreaChart({ title, series }: { title: string; series: ChartSeries[] }) {
  const [activeKey, setActiveKey] = useState(series[0]?.key);
  const gradId = useId().replace(/:/g, "");
  const active = series.find((s) => s.key === activeKey) ?? series[0];
  const c = coords(active.points);

  return (
    <Card className="animate-in">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <CardTitle className="text-sm text-ink">{title}</CardTitle>
          <div className="flex items-center gap-4">
            {series.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveKey(s.key)}
                className={cn(
                  "text-sm transition-colors",
                  s.key === active.key ? "font-medium text-ink" : "text-ink-soft hover:text-ink"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="relative h-[220px] w-full">
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
              </linearGradient>
              <style>{`
                @keyframes line-draw {
                  from { stroke-dashoffset: 1000; }
                  to { stroke-dashoffset: 0; }
                }
                .chart-line {
                  stroke-dasharray: 1000;
                  animation: line-draw 1s ease-out forwards;
                }
              `}</style>
            </defs>
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="var(--rule)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={smoothPath(c, true)} fill={`url(#area-${gradId})`} opacity="0.5" />
            <path
              className="chart-line"
              d={smoothPath(c, false)}
              fill="none"
              stroke="var(--c-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {c.map((d) => (
            <div
              key={d.point.label}
              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-c-primary transition-smooth"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
              }}
              title={`${humanizeSlug(d.point.label)}: ${d.point.count.toLocaleString("en-US")}`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-1">
          {active.points.map((p) => (
            <span key={p.label} className="flex-1 truncate text-center text-[11px] text-ink-soft">
              {humanizeSlug(p.label)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
