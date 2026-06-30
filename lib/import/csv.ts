export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        current.push(field);
        field = "";
        i++;
      } else if (ch === '\r' && text[i + 1] === '\n') {
        current.push(field);
        field = "";
        records.push(current);
        current = [];
        i += 2;
      } else if (ch === '\n') {
        current.push(field);
        field = "";
        records.push(current);
        current = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  current.push(field);
  records.push(current);

  const nonEmpty = records.filter((r) => r.some((f) => f.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0];
  const rows: Record<string, string>[] = [];

  for (let li = 1; li < nonEmpty.length; li++) {
    const values = nonEmpty[li];
    if (values.every((v) => v === "")) continue;
    const row: Record<string, string> = {};
    for (let hi = 0; hi < headers.length; hi++) {
      row[headers[hi]] = values[hi] ?? "";
    }
    rows.push(row);
  }

  return { headers, rows };
}

const IDENTITY_FIELDS = ["domain", "linkedin_url", "company_name", "full_name", "first_name"] as const;

// Postgres array columns — incoming CSV values are comma-separated strings and
// must be split into string arrays before insert/update.
const ARRAY_FIELDS = new Set(["technologies", "keywords"]);

export function applyColumnMap(
  rows: Record<string, string>[],
  columnMap: Record<string, string>
): Record<string, unknown>[] {
  return rows
    .map((row) => {
      const out: Record<string, unknown> = {};
      for (const [csvHeader, supabaseField] of Object.entries(columnMap)) {
        if (supabaseField === "ignore" || !supabaseField) continue;
        const val = row[csvHeader];
        if (val !== undefined && val !== "") {
          if (supabaseField === "custom_data") {
            const existing = out.custom_data as Record<string, string> | undefined;
            out.custom_data = { ...existing, [csvHeader]: val };
          } else if (ARRAY_FIELDS.has(supabaseField)) {
            out[supabaseField] = val
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s !== "");
          } else {
            out[supabaseField] = val;
          }
        }
      }
      return out;
    })
    .filter((row) => IDENTITY_FIELDS.some((f) => row[f] != null && row[f] !== ""));
}
