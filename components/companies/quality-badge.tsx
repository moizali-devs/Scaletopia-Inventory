import { cn } from "@/lib/utils";

const TIER_LABEL: Record<string, string> = {
  tier_1: "Tier 1",
  tier_2: "Tier 2",
  tier_3: "Tier 3",
};

export function QualityBadge({ tier }: { tier: string | null }) {
  if (!tier) {
    return <span className="text-xs text-ink-soft">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tier === "tier_1" && "bg-success/15 text-success",
        tier === "tier_2" && "bg-warning/15 text-warning",
        tier === "tier_3" && "bg-rule/50 text-ink-soft"
      )}
    >
      {TIER_LABEL[tier] ?? tier}
    </span>
  );
}
