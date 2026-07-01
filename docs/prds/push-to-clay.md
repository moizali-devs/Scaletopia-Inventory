## Problem Statement

Users of the Companies dashboard can filter down to a specific slice of companies (by tags, client, niche, quality tier, etc.) but have no way to send that slice out to Clay for outbound/enrichment work without falling back to a standalone script outside the app. Previously this was done by hand-invoking a one-off Supabase Edge Function; there is no way to trigger it from the dashboard itself, no visibility into which companies have already been pushed, and no feedback in the UI about what succeeded or failed.

## Solution

Add a "Push to Clay" action to the Companies results toolbar, next to the existing Export button. It acts on the same filtered result set currently on screen. Clicking it pushes every matching company that hasn't already been sent to Clay, POSTing each one's profile to a configured Clay webhook, marking each success in the database (`pushed_to_clay`, `pushed_to_clay_at`) so it won't be re-sent next time, and reporting a summary (pushed / errored / total) back to the user via a toast — the same feedback pattern Export already uses.

## User Stories

1. As a dashboard user, I want a "Push to Clay" button next to Export, so that I can send my current filtered view of companies to Clay without leaving the app.
2. As a dashboard user, I want the push to only act on the companies currently matching my filters, so that the button's scope is predictable and matches what I see on screen.
3. As a dashboard user, I want companies already pushed to Clay to be silently skipped on subsequent pushes, so that re-running a filter doesn't spam Clay with duplicate webhook calls.
4. As a dashboard user, I want to see a confirmation prompt before the push fires, so that I don't accidentally push a very broad or unintended filter set.
5. As a dashboard user, I want a summary toast after the push completes, so that I know how many companies were pushed, how many failed, and (for a handful) which ones failed.
6. As a dashboard user, I want the push to keep running even if it takes several minutes for a large filtered set, so that I don't hit a timeout error partway through.
7. As a developer maintaining this feature, I want the webhook credential to live only in Supabase Edge Function secrets, so that it's never exposed to the Next.js server process or the browser.
8. As a developer maintaining this feature, I want the push logic to reuse the same filter-resolution code as CSV export, so that "what counts as the current filtered set" stays consistent across features.
9. As a developer maintaining this feature, I want the per-row webhook loop and its "mark as pushed" side effect isolated in one testable function, so that the throttle/error-handling/skip logic can be verified without needing to actually deploy or trigger the edge function from the app.
10. As a developer maintaining this feature, I want failed pushes for individual companies to not block the rest of the batch, so that one bad row (e.g. failed webhook delivery) doesn't stop the whole run.
11. As a data owner, I want `pushed_to_clay` and `pushed_to_clay_at` to remain hidden from all company/person detail views, so that this internal bookkeeping doesn't leak into user-facing data (already enforced by existing `BLOCKED_KEYS` logic — must not regress).
12. As a developer, I want the Supabase CLI project scaffolding (`supabase/config.toml`, `supabase/functions/`) introduced cleanly, so that future Edge Functions have a home and a consistent deploy path.

## Implementation Decisions

- **Scope of push = current filtered set**, identical semantics to the existing Export button (same filter-parsing module governs both), not a row-by-row checkbox selection. No new row-selection UI is introduced in the companies table.
- **Skip-already-pushed is the default and only behavior for this PRD**: any company matching the current filters where `pushed_to_clay` is already true is excluded from the push automatically. No UI toggle for "force re-push" is included in this scope.
- **Execution model: Supabase Edge Function**, introduced fresh into this repo (no `supabase/` CLI project currently exists). The Next.js route is a thin pass-through: it resolves the incoming request's filters into a `CompanyListFilters` value (reusing the same parsing used by CSV export) and invokes the Edge Function via the Supabase Admin client's `functions.invoke`, then relays the JSON result to the browser unchanged. This avoids Vercel's request execution time limit for what can be a multi-minute serial loop over up to several thousand rows.
- **Webhook credential lives only as a Supabase Edge Function secret** (e.g. `CLAY_WEBHOOK_URL`), set via the Supabase CLI/dashboard, never as a Next.js env var and never accepted from the client request body. This is a deliberate change from the original standalone script, which took `webhook_url` as a request parameter — that trust model doesn't fit an app where any visitor could otherwise supply an arbitrary POST target.
- **Core orchestration seam**: a single function (name suggested: `runClayPush(filters, fetchImpl?)`) owns the whole feature's testable logic — querying `companies` for rows matching the filters AND not yet pushed, running the per-company webhook POST loop with the existing throttle, tracking success/failure per row, and updating `pushed_to_clay` / `pushed_to_clay_at` for successes. `fetchImpl` is injectable (defaults to global `fetch`) so tests can substitute a stub, mirroring the `pushRecords(opts, progressCallback)` shape already used for CSV/record imports. This function lives inside the Edge Function itself, since that's the runtime that must run it in production; the Next.js route does not duplicate any of this logic.
- **Response contract** returned by the Edge Function (and relayed verbatim by the Next.js route) matches the shape of the original script: `{ total_found, pushed, errors, failed_companies }`, where `failed_companies` is capped to a reasonable preview length (matching the original's `slice(0, 20)`).
- **UI**: `components/companies/push-to-clay-button.tsx`, a client component styled like the existing `export-button.tsx` (same `ink-soft` / `rule` / `stamp` design tokens), placed in the results toolbar in `companies-results-client.tsx` beside Export.
- **Confirmation step**: clicking the button opens a confirmation prompt showing how many companies are about to be pushed before firing the request, to guard against an unintentionally broad filter. No additional access control (auth, roles, passcode) is added — the app currently has no auth system anywhere, and building one for a single button would be a mismatched, out-of-scope investment.
- **No changes to `custom-data.ts` / `people.ts` blocklists are needed** — `pushed_to_clay` and `pushed_to_clay_at` are already excluded from detail-view rendering; this PRD must not regress that.
- **New repo scaffolding**: `supabase/config.toml` and `supabase/functions/push-to-clay/index.ts` are introduced as the first Supabase CLI-managed project artifacts in this repo. `.env.example` gains a comment noting `CLAY_WEBHOOK_URL` is a Supabase Edge Function secret, set via the Supabase CLI, not a Next.js environment variable.

## Testing Decisions

- Good tests here verify externally observable behavior: given a set of companies matching a filter (some already pushed, some not) and a stubbed `fetchImpl`, does `runClayPush` push only the unpushed ones, correctly mark successes, correctly report failures without aborting the batch, and return the right summary counts — not the internal throttle timing or fetch call mechanics.
- `runClayPush` is the single module under test. It runs against the real Supabase database (no mocking the DB layer), consistent with existing prior art (`lib/import/push.test.ts`, `lib/data/companies-csv.test.ts` both hit the live Supabase instance directly). Test rows use a `__test-` prefixed domain and are cleaned up in `beforeAll`/`afterAll`, exactly as `push.test.ts` does.
- Because `runClayPush` lives inside a Supabase Edge Function (Deno runtime), it is tested with Deno's built-in test runner (`deno test`), not Vitest — Vitest cannot execute Deno-runtime code. This is a new test runner for the repo, introduced as a direct consequence of Edge Functions being a new runtime, not an additional seam chosen for convenience.
- The Next.js route handler (`app/companies/push-to-clay/route.ts`) is left untested at the unit level, matching the existing precedent set by `app/companies/export/route.ts` (also untested directly — its delegate, `exportCompaniesCsv`, carries the test coverage instead).
- Existing tests asserting `pushed_to_clay` / `pushed_to_clay_at` never leak into detail views (`lib/data/custom-data.test.ts`, `lib/data/companies.test.ts`) must continue to pass unmodified — this PRD does not touch that blocklist.

## Out of Scope

- Row-level checkbox selection for a manually curated push (only whole-filtered-set pushes are supported).
- A "force re-push" option for companies already marked `pushed_to_clay`.
- Any authentication, authorization, or role-based access control for who can trigger a push.
- A background job queue, progress bar, or async status page for long-running pushes — the Edge Function's own execution lifetime is relied on directly.
- Editing company records or any other Clay-related campaign management — this PRD is push-only.
- Changes to the `people` table's equivalent `pushed_to_emailbison` / `pushed_to_ghl` push mechanisms — out of scope, though structurally analogous.

## Further Notes

- The original implementation (a standalone Supabase Edge Function taking `webhook_url` as a request parameter) is being restored, not invented — but with the webhook trust model changed to fit an app with no auth: the client can no longer supply an arbitrary POST target, only trigger a push to a fixed, server-configured Clay webhook.
- `task3.md` / `docs/Task.txt` originally listed "no pushing to Clay" as explicitly out of scope for the initial build — this PRD is deliberately expanding scope beyond that original spec, aligned with the client's actual usage need.
- `docs/DB-Findings.md` confirms RLS is disabled and the `service_role` key can read/write all rows; this must remain server-side only (already true for `lib/supabase/admin.ts`, and equally true for the Edge Function's own service-role usage).
