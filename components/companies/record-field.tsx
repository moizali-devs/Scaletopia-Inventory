export function RecordField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule py-2.5 last:border-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-right text-sm text-ink">{children}</span>
    </div>
  );
}
