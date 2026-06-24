export function Tally({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 border border-rule bg-card px-6 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-mono text-5xl font-semibold tabular-nums tracking-tight md:text-6xl">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
