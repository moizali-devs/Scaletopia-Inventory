"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

const COLORS = [
  "var(--c-blue)",
  "var(--c-cyan)",
  "var(--c-mint)",
  "var(--c-purple)",
  "var(--c-green)",
  "var(--c-indigo)",
];

const HOVER_GLOW = [
  "var(--c-blue)",
  "var(--c-cyan)",
  "var(--c-mint)",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20px" });

  return (
    <Card
      ref={containerRef}
      className="flex h-full flex-col animate-in transition-shadow hover:shadow-[var(--card-shadow-hover)] hover-lift"
    >
      <CardHeader>
        <CardTitle className="text-sm text-ink uppercase tracking-wide font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-1 items-end gap-3 sm:gap-4" ref={containerRef}>
          {top.map((entry, i) => {
            const heightPct = Math.max(4, (entry.count / max) * 100);
            const isTop = i === 0;
            return (
              <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center gap-2 group">
                <div
                  className="relative h-[150px] w-full"
                  title={`${entry.count.toLocaleString("en-US")}`}
                >
                  {/* Axis tick marks */}
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map((pct) => (
                      <div key={pct} className="h-px w-full bg-rule/50" />
                    ))}
                  </div>

                  {/* Bar */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[28px] rounded-lg cursor-pointer"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                      transformOrigin: "bottom",
                    }}
                    initial={isInView ? { scaleY: 0, opacity: 0 } : {}}
                    animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
                    transition={{
                      delay: 0.2 + i * 0.08,
                      duration: 0.5,
                      ease: [0.25, 1, 0.5, 1], // easeOutQuart-like
                    }}
                    whileInView={{ scaleY: 1 }}
                    whileHover={{
                      scaleY: 1.05,
                      boxShadow: `0 0 20px ${HOVER_GLOW[i % HOVER_GLOW.length]}60`,
                    }}
                    layoutId={`bar-${entry.id}`}
                  />

                  {isTop && (
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-stamp drop-shadow-lg"
                      initial={{ opacity: 0, scale: 0, y: 8 }}
                      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Crown size={14} />
                    </motion.div>
                  )}
                </div>
                <motion.span
                  className="w-full truncate text-center text-[11px] text-ink-mute font-medium"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  {humanizeSlug(entry.label)}
                </motion.span>
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <motion.span
                    className="text-[10px] font-semibold tabular-nums text-ink-mute transition-all group-hover:text-ink"
                    whileHover={{ scale: 1.1 }}
                  >
                    {compact(entry.count)}
                  </motion.span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
