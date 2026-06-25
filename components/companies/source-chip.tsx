import { sourceLabel } from "@/lib/data/source";

export function SourceChip({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-rule/50 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {sourceLabel(id)}
    </span>
  );
}
