const TYPE_LABEL: Record<string, string> = {
  mobile: "Mobile",
  toll_free: "Toll-free",
  landline: "Landline",
};

export function PhoneTypeBadge({ phone, type }: { phone: string | null; type: string | null }) {
  if (!phone || !type) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-rule bg-greenbar/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}
