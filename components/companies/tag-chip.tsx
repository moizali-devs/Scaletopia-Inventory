export function TagChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-rule bg-card px-2.5 py-1 font-mono text-xs text-ink">
      {value}
    </span>
  );
}
