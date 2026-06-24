export function RecordField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
        {label}
      </span>
      <span aria-hidden className="flex-1 border-b border-dotted border-rule" style={{ marginBottom: "0.3em" }} />
      <span className="text-right text-sm text-ink">{children}</span>
    </div>
  );
}
