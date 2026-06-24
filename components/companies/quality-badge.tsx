import { cn } from "@/lib/utils";

const TIER_LABEL: Record<string, string> = {
  tier_1: "Tier 1",
  tier_2: "Tier 2",
  tier_3: "Tier 3",
};

export function QualityBadge({ tier }: { tier: string | null }) {
  if (!tier) {
    return <span className="font-mono text-xs text-ink-soft">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        tier === "tier_1" && "border-stamp bg-stamp text-paper",
        tier === "tier_2" && "border-ink text-ink",
        tier === "tier_3" && "border-rule text-ink-soft"
      )}
    >
      {TIER_LABEL[tier] ?? tier}
    </span>
  );
}
