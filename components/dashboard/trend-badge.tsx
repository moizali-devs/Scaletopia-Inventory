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
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium animate-in",
        isPositive
          ? "bg-success/10 text-success"
          : "bg-danger/10 text-danger",
        className
      )}
    >
      <Icon size={14} className="animate-bounce" style={{ animationDelay: "0s" }} />
      <span>
        {isPositive ? "+" : ""}{trend}%
      </span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
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
    <div className="flex flex-col gap-2 rounded-lg border border-rule bg-card px-4 py-3 animate-in">
      <p className="text-xs text-ink-soft">{title}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-ink">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </span>
        <TrendBadge trend={trend} label={trendLabel} />
      </div>
    </div>
  );
}
