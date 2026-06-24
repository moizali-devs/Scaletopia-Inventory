# Supabase Data Findings — Scaletopia Inventory

> Investigation notes from connecting to the live Supabase store and comparing
> the **actual data** against `docs/Task.txt`. Date: 2026-06-23.
> Conclusion up front: **the real data deviates from the task spec in several
> material ways.** Where they conflict, trust the real data shape — these notes
> document each deviation and the intended handling.

## Connection

- **REST API:** `https://swfykpknnfunpapzoudn.supabase.co/rest/v1/`
- **RLS:** disabled. `service_role` key works and reads all rows; it must stay
  **server-side only** (never shipped to the browser).
- Verified both keys (`service_role`, `anon`) authenticate successfully.

## Scale

| Table | Row count |
|-----------|-----------|
| companies | **29,184** |
| people    | **6,515**  |

At this scale, the Overview aggregations (niche/source breakdowns), filtering by
niche/source tokens, and CSV export should be done **server-side (SQL / RPC)**,
not by pulling all rows into the browser.

## Actual table shapes (from live `select=*`)

### companies
`id, company_name, domain, website_url, linkedin_url, industry, city, state,
country, employee_count, phone, description, founded_year, revenue, source,
client, niche, tags, last_updated, created_at, domain_status, mx_provider,
security_gateway, quality_tier, keywords, technologies, custom_data,
pushed_to_clay, pushed_to_clay_at`

### people
`id, company_id, first_name, last_name, full_name, email, phone, job_title,
linkedin_url, city, state, country, company_name, domain, source, tags,
pushed_to_emailbison, pushed_to_emailbison_at, pushed_to_ghl, pushed_to_ghl_at,
last_updated, created_at, email_status, phone_type, custom_data, source_id,
linkedin_username`

---

## Deviations from `Task.txt` (the important part)

### 1. Source delimiter is NOT always a comma
The task says source is comma-separated everywhere. Reality:

- **companies** — comma-separated, as spec'd: `"aiark-api,blitz-api"` ✅
- **people** — separated by `" & "`: e.g. `"blitz & Ai Ark"` ❌ (no comma)

Observed company source values (sample):
```
blitz-api, aiark-api, aiark-api,blitz-api, apollo, apollo-scraped,
aiark-api,aiark-api,blitz-api, apollo,store-leads, blitz-api,aiark-api,blitz-api
```
Observed people source values (sample):
```
blitz & Ai Ark, aiark-people, blitz-people, clay-people
```

Problems: different delimiters, **inconsistent token naming across tables**
(`aiark-api` vs `aiark-people` vs `Ai Ark`; `blitz-api` vs `blitz-people` vs
`blitz`), and **duplicate tokens** within a single value.

**Handling:** split on both `,` and `&`, trim whitespace, dedupe, then
**normalize** tokens to a canonical set so a filter for `aiark` matches
`aiark-api` / `aiark-people` / `Ai Ark` alike. *(Open question: confirm desired
normalization map, or display tokens raw.)*

### 2. companies have dedicated `niche` and `client` columns
The task says niche must be extracted by parsing tags. But companies already have
clean `niche` and `client` columns.

**Handling:** use the `niche` / `client` columns for companies (reliable);
only parse tags for **people**, which have no such columns.

### 3. Tag formats are mixed — both styles exist
The task says tags are a flat, unkeyed array (`[client, niche, date]`). Reality
has **both**:

- Flat (matches spec): `["kynship","dtc-beauty","2026-04-24"]`
- Keyed (spec says this never happens):
  `["niche:marketing-agencies","source:apollo","geo:us","imported:2026-04",
  "campaign:scaletopia-marketing-agencies-2026-04", "campaign:..."]`

**Handling:** the tag parser must handle both — strip date entries
(`YYYY-MM-DD`), strip prefixed entries (`campaign:`, `geo:`, `imported:`,
`source:`), use the `niche:` value when present, otherwise fall back to
"drop dates + known client names; remainder is niche."

### 4. "Known client names" list — now self-derivable
The task implies we need an external list of client names to strip from tags.
We can instead derive it from the companies `client` column
(`select distinct client`). No external list needed.

### 5. people are denormalized — partial join needed
People rows already carry `country`, `city`, `state`, `company_name`, `domain`.
So:
- **Country filter** on People needs **no join** (use person's own `country`).
- **Employee Size** and **Industry** filters DO still need a join to `companies`
  (those fields are not on the person row), as the task notes.

### 6. Extra fields exist beyond the task list
companies: `website_url, phone, description, founded_year, revenue, keywords,
technologies, pushed_to_clay(_at)`.
people: `full_name, linkedin_username, source_id, pushed_to_emailbison(_at),
pushed_to_ghl(_at)`.
These are available if useful; `pushed_to_*` should be treated as internal/hidden
per the custom-data blocklist spirit.

### 7. custom_data keys can contain spaces
Example company `custom_data`: `{"core service": "customer_support_outsourcing"}`.
Blocklist matching and display must handle arbitrary key strings (incl. spaces).

---

## Open questions for the user
1. Source **normalization map** — define canonical tokens (e.g. everything
   aiark-ish → `aiark`), or display raw tokens as-is?
2. Confirm the **"trust real data over task prose"** approach where they conflict
   (recommended).

## Notes on tooling
- The `service_role` key over REST is sufficient for all dev introspection.
- Supabase MCP is optional (uses a separate Personal Access Token, not the
  service_role key). Not required to proceed.
