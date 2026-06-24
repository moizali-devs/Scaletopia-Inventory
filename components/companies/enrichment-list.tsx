import { cn } from "@/lib/utils";

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export function EnrichmentList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-rule px-5 py-6 text-center font-mono text-xs italic text-ink-soft">
        No enrichment data
      </div>
    );
  }

  return (
    <ol className="border border-rule bg-card">
      {entries.map(([key, value], i) => (
        <li
          key={key}
          className={cn("flex items-baseline gap-3 px-5 py-2.5", i % 2 === 1 && "bg-greenbar/60")}
        >
          <span className="w-1/3 shrink-0 truncate font-mono text-xs uppercase tracking-wide text-ink-soft">
            {key}
          </span>
          <span className="flex-1 text-sm text-ink">{formatValue(value)}</span>
        </li>
      ))}
    </ol>
  );
}
