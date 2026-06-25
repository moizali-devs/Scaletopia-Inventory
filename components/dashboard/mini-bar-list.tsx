"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { humanizeSlug } from "@/lib/utils";
import type { BreakdownEntry } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BAR_COLORS = [
  "var(--c-blue)",
  "var(--c-cyan)",
  "var(--c-mint)",
  "var(--c-purple)",
  "var(--c-green)",
  "var(--c-indigo)",
];

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
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20px" });

  return (
    <Card
      ref={containerRef}
      className="flex h-full flex-col animate-in transition-shadow hover:shadow-[var(--card-shadow-hover)] hover-lift"
    >
      <CardHeader>
        <CardTitle className="text-sm text-ink">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col justify-between gap-4">
          {top.map((entry, i) => (
            <motion.li
              key={entry.id}
              className="flex items-center gap-3 text-[13px]"
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
            >
              <span className="w-20 shrink-0 truncate text-ink">{humanizeSlug(entry.label)}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-c-track">
                <motion.span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.max(4, (entry.count / max) * 100)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{
                    delay: 0.2 + i * 0.06,
                    duration: 0.5,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                />
              </span>
              <motion.span
                className="text-xs font-medium tabular-nums text-ink-mute min-w-[2.5rem] text-right"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                {entry.count.toLocaleString("en-US")}
              </motion.span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
