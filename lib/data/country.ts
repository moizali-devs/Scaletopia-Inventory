// Real data has both genuine synonyms (US vs United States) and bare casing
// variants (Canada vs canada). See docs/DB-Findings.md.
const COUNTRY_ALIASES: Record<string, { id: string; label: string }> = {
  us: { id: "US", label: "United States" },
  usa: { id: "US", label: "United States" },
  "united states": { id: "US", label: "United States" },
  gb: { id: "GB", label: "United Kingdom" },
  uk: { id: "GB", label: "United Kingdom" },
  "united kingdom": { id: "GB", label: "United Kingdom" },
  ca: { id: "CA", label: "Canada" },
  canada: { id: "CA", label: "Canada" },
};

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeCountry(raw: string | null | undefined): { id: string; label: string } | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const alias = COUNTRY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  const id = trimmed.toUpperCase();
  return { id, label: titleCase(trimmed) };
}
