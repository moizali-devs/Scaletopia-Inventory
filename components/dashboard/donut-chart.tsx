"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

const COLORS = [
  "var(--c-blue)",
  "var(--c-cyan)",
  "var(--c-mint)",
  "var(--c-purple)",
  "var(--c-indigo)",
];

const R = 38;
const CIRC = 2 * Math.PI * R;

interface HoveredSegment {
  id: string;
  label: string;
  pct: number;
  count: number;
  color: string;
}

export function DonutChart({
  title,
  entries,
  limit = 5,
  filterParam,
}: {
  title: string;
  entries: BreakdownEntry[];
  limit?: number;
  filterParam?: string;
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
      rotate: before * 360,
      pct: fractions[i] * 100,
      label: s.label,
      id: s.id,
      count: s.count,
      isTop: i === 0,
    };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20px" });
  const [hovered, setHovered] = useState<HoveredSegment | null>(null);
  const router = useRouter();

  return (
    <Card
      ref={containerRef}
      className="animate-in transition-shadow hover:shadow-[var(--card-shadow-hover)] hover-lift"
    >
      <CardHeader>
        <CardTitle className="text-sm text-ink uppercase tracking-wide font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="size-[120px] shrink-0 -rotate-90">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--c-track)"
              strokeWidth="14"
            />

            {segments.map((s, i) => (
              <motion.g
                key={s.id}
                onMouseEnter={() =>
                  setHovered({
                    id: s.id,
                    label: s.label,
                    pct: s.pct,
                    count: s.count,
                    color: s.color,
                  })
                }
                onMouseLeave={() => setHovered(null)}
                onClick={filterParam && s.id !== "other" ? () => router.push(`/companies?${filterParam}=${encodeURIComponent(s.id)}`) : undefined}
                style={{ cursor: filterParam && s.id !== "other" ? "pointer" : "default" }}
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.isTop ? "16" : "14"}
                  strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
                  strokeLinecap="round"
                  transform={`rotate(${s.rotate} 50 50)`}
                  initial={{ strokeDasharray: `0 ${CIRC}`, opacity: 0 }}
                  animate={
                    isInView
                      ? { strokeDasharray: `${s.dash} ${CIRC - s.dash}`, opacity: 1 }
                      : {}
                  }
                  transition={{
                    delay: 0.2 + i * 0.1,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  whileInView={{
                    filter:
                      hovered?.id === s.id
                        ? `drop-shadow(0 0 12px ${s.color}80) brightness(1.2)`
                        : s.isTop
                          ? `drop-shadow(0 0 8px ${s.color}40)`
                          : `drop-shadow(0 0 0px transparent)`,
                  }}
                  style={{
                    transition: "filter 0.2s ease",
                  }}
                />
              </motion.g>
            ))}
          </svg>

          {/* Center label on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-[18px] font-bold tabular-nums text-ink">
                  {(hovered.pct).toFixed(0)}%
                </span>
                <span className="text-[9px] text-ink-mute truncate max-w-[80px]">
                  {humanizeSlug(hovered.label)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ul className="flex flex-1 flex-col gap-2.5">
          {segments.map((s, i) => (
            <motion.li
              key={s.id}
              className={`flex items-center gap-2 text-[13px] group${filterParam && s.id !== "other" ? " cursor-pointer" : ""}`}
              initial={{ opacity: 0, x: 8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.06 }}
              onMouseEnter={() =>
                setHovered({ id: s.id, label: s.label, pct: s.pct, count: s.count, color: s.color })
              }
              onMouseLeave={() => setHovered(null)}
              onClick={filterParam && s.id !== "other" ? () => router.push(`/companies?${filterParam}=${encodeURIComponent(s.id)}`) : undefined}
              title={filterParam && s.id !== "other" ? `Filter by ${humanizeSlug(s.label)}` : undefined}
            >
              <motion.span
                className={`shrink-0 rounded-full transition-all`}
                style={{
                  backgroundColor: s.color,
                  width: s.isTop || hovered?.id === s.id ? 12 : 8,
                  height: s.isTop || hovered?.id === s.id ? 12 : 8,
                }}
                animate={
                  hovered?.id === s.id
                    ? { scale: 1.3, boxShadow: `0 0 10px ${s.color}60` }
                    : { scale: 1, boxShadow: "0 0 0px transparent" }
                }
              />
              <span className="min-w-0 flex-1 truncate text-ink">{humanizeSlug(s.label)}</span>
              <div className="flex items-center gap-1">
                {s.isTop && <Crown size={12} className="text-stamp" />}
                <span
                  className={`font-medium tabular-nums transition-all ${
                    s.isTop ? "text-ink font-bold" : "text-ink-mute"
                  } group-hover:text-ink`}
                >
                  {s.pct.toFixed(1)}%
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
