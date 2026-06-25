"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendBadge({
  trend,
  label,
  className,
}: {
  trend: number;
  label: string;
  className?: string;
}) {
  const isPositive = trend >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isPositive
          ? "bg-success/10 text-success"
          : "bg-danger/10 text-danger",
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={{
          y: isPositive ? [0, -2, 0] : [0, 2, 0],
          rotate: isPositive ? [0, 8, -4, 0] : [0, -8, 4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <Icon size={14} />
      </motion.div>
      <span>
        {isPositive ? "+" : ""}{trend}%
      </span>
      <span className="text-xs opacity-75">{label}</span>
    </motion.div>
  );
}

export function InsightCard({
  title,
  value,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
}) {
  return (
    <motion.div
      className="flex flex-col gap-2 rounded-lg border border-rule bg-card px-4 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ y: -2, boxShadow: "var(--card-shadow-hover)" }}
    >
      <p className="text-xs text-ink-soft">{title}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-ink">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </span>
        <TrendBadge trend={trend} label={trendLabel} />
      </div>
    </motion.div>
  );
}
