const BLOCKED_KEYS = new Set([
  "naics",
  "aiark_id",
  "industries",
  "legal_name",
  "ai_ark_approaches",
  "pushed_to_clay",
  "created_at",
  "updated_at",
  "company_type",
]);

function isHousekeepingKey(key: string): boolean {
  return BLOCKED_KEYS.has(key) || key.startsWith("pushed_to_") || key.endsWith("_at");
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/** Applies the Company/Person Detail custom_data display rules: drop
 * housekeeping keys and any key whose value is null/empty string/empty array.
 * `extraBlockedKeys` lets Person Detail layer on its additional blocklist. */
export function filterCustomData(
  raw: Record<string, unknown> | null | undefined,
  extraBlockedKeys: readonly string[] = []
): Record<string, unknown> {
  if (!raw) return {};
  const extra = new Set(extraBlockedKeys);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isHousekeepingKey(key) || extra.has(key)) continue;
    if (isEmptyValue(value)) continue;
    result[key] = value;
  }
  return result;
}
