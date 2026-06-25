import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  ok: "OK",
  catch_all: "Catch-all",
  invalid: "Invalid",
  unknown: "Unknown",
};

export function EmailStatusBadge({
  email,
  status,
}: {
  email: string | null;
  status: string | null;
}) {
  if (!email || !status) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        status === "ok" && "bg-success/15 text-success",
        status === "catch_all" && "bg-warning/15 text-warning",
        status === "invalid" && "bg-danger/15 text-danger",
        status === "unknown" && "bg-rule/50 text-ink-soft"
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
