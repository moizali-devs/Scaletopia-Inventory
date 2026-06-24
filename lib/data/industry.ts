// Industry strings are messy LinkedIn-style category text: casing varies
// freely, and ";" / "," are both used as item separators within the same
// underlying value (e.g. "Technology; Information and Internet" vs
// "technology, information and internet"). Normalize both away for grouping
// and filtering; never split into multiple tokens (unlike Source).
function canonicalKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/;/g, ",")
    .replace(/\s+/g, " ");
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeIndustry(raw: string | null | undefined): { id: string; label: string } | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const id = canonicalKey(trimmed);
  return { id, label: titleCase(id) };
}
