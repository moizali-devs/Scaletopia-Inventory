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
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        status === "ok" && "border-stamp bg-stamp text-paper",
        status === "catch_all" && "border-ink text-ink",
        status === "invalid" && "border-rule text-ink-soft",
        status === "unknown" && "border-rule text-ink-soft"
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
