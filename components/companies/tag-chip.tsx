export function TagChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-rule px-2.5 py-1 text-xs text-ink">
      {value}
    </span>
  );
}
