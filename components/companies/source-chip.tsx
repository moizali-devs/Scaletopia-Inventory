import { sourceLabel } from "@/lib/data/source";

export function SourceChip({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-rule bg-greenbar/60 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
      {sourceLabel(id)}
    </span>
  );
}
