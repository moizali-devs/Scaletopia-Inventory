const TYPE_LABEL: Record<string, string> = {
  mobile: "Mobile",
  toll_free: "Toll-free",
  landline: "Landline",
};

export function PhoneTypeBadge({ phone, type }: { phone: string | null; type: string | null }) {
  if (!phone || !type) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-rule/50 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}
