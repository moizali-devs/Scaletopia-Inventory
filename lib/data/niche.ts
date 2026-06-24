const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STRIPPED_PREFIXES = ["campaign:", "geo:", "imported:", "source:"];

/** Extracts niche values from a person's tags, used only when their linked
 * company's `niche` column is empty. Tags mix two styles (see
 * docs/DB-Findings.md): flat (`[client, niche, date, niche2, date2, ...]`)
 * and keyed (`niche:value` plus other `prefix:value` tags to ignore). A
 * keyed `niche:` tag is used directly; otherwise dates, known prefixes, and
 * known client names are stripped and everything left is niche — there can
 * be more than one when a record was pulled for several campaigns. */
export function nichesFromTags(
  tags: string[] | null | undefined,
  knownClients: ReadonlySet<string>
): string[] {
  if (!tags?.length) return [];

  const keyed = tags
    .filter((t) => t.toLowerCase().startsWith("niche:"))
    .map((t) => t.slice(t.indexOf(":") + 1).trim())
    .filter(Boolean);
  if (keyed.length > 0) return Array.from(new Set(keyed));

  const remainder = tags.filter((tag) => {
    const lower = tag.trim().toLowerCase();
    if (DATE_RE.test(tag.trim())) return false;
    if (STRIPPED_PREFIXES.some((p) => lower.startsWith(p))) return false;
    if (knownClients.has(lower)) return false;
    return true;
  });

  return Array.from(new Set(remainder));
}
