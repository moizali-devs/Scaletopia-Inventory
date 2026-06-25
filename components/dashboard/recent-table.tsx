"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { humanizeSlug, timeAgo } from "@/lib/utils";
import type { RecentCompany } from "@/lib/data/dashboard";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentTable({
  title,
  rows,
}: {
  title: string;
  rows: RecentCompany[];
}) {
  const now = new Date();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20px" });

  return (
    <Card
      ref={containerRef}
      className="min-w-0 animate-in transition-shadow hover:shadow-[var(--card-shadow-hover)] hover-lift"
    >
      <CardHeader>
        <CardTitle className="text-sm text-ink">{title}</CardTitle>
        <CardAction>
          <Link href="/companies" className="text-xs font-medium text-stamp hover:underline">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs font-medium text-ink-mute">
              <th className="pb-2 pr-4 font-medium">Company</th>
              <th className="pb-2 pr-4 font-medium">Niche</th>
              <th className="pb-2 pr-4 font-medium">Country</th>
              <th className="pb-2 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id}
                className="border-b border-rule last:border-0 transition-colors hover:bg-hover/50"
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
              >
                <td className="py-2.5 pr-4 font-medium text-ink">{r.name}</td>
                <td className="py-2.5 pr-4 text-ink-mute">{r.niche ? humanizeSlug(r.niche) : "—"}</td>
                <td className="py-2.5 pr-4 text-ink-mute">{r.country ?? "—"}</td>
                <td className="py-2.5 text-ink-mute">{timeAgo(r.createdAt, now)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
