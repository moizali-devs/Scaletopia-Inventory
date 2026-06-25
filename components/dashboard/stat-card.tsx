import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Variant = "blue" | "purple" | "plain";

const VARIANT_STYLES: Record<Variant, string> = {
  blue: "border-transparent bg-pastel-blue shadow-none",
  purple: "border-transparent bg-pastel-purple shadow-none",
  plain: "shadow-[var(--card-shadow)]",
};

export function StatCard({
  label,
  value,
  hint,
  variant = "plain",
}: {
  label: string;
  value: number;
  hint?: string;
  variant?: Variant;
}) {
  return (
    <Card className={cn("gap-3 px-6 py-6 animate-in", VARIANT_STYLES[variant])}>
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
          {value.toLocaleString("en-US")}
        </span>
        {hint ? (
          <span className="flex items-center gap-0.5 whitespace-nowrap pb-1 text-xs text-ink-soft">
            {hint}
            <ArrowUpRight size={13} />
          </span>
        ) : null}
      </div>
    </Card>
  );
}
