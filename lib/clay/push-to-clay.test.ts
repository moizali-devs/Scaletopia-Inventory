import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  runClayPush,
  resolveClayPushCounts,
  FAILED_PREVIEW,
} from "@/lib/clay/push-to-clay";

const TEST_PREFIX = "__test-clay-push__";

function testDomain(niche: string, slug: string) {
  return `${TEST_PREFIX}${niche}-${slug}.example.com`;
}

async function cleanup() {
  await supabaseAdmin.from("companies").delete().like("domain", `${TEST_PREFIX}%`);
}

// `fetchImpl` is always stubbed in these tests, so the URL itself is never
// dereferenced — but `runClayPush` requires the env var to be set before it
// will do any work, so ensure it's present regardless of local .env state.
// `.env.local` may define CLAY_WEBHOOK_URL="" (present but not yet configured
// with a real value), so treat any falsy value — not just null/undefined —
// as "unset" for test purposes.
beforeAll(() => {
  process.env.CLAY_WEBHOOK_URL ||= "https://example.com/test-clay-webhook";
});
beforeAll(cleanup);
afterAll(cleanup);

async function seedCompanies(
  niche: string,
  rows: { slug: string; pushed?: boolean }[]
) {
  const { error } = await supabaseAdmin.from("companies").insert(
    rows.map((r) => ({
      domain: testDomain(niche, r.slug),
      company_name: `Clay Test ${r.slug}`,
      niche,
      pushed_to_clay: r.pushed ?? false,
    }))
  );
  if (error) throw error;
}

function okFetch(): typeof fetch {
  return vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
}

let nicheCounter = 0;
function uniqueNiche(label: string) {
  nicheCounter++;
  return `${TEST_PREFIX}${label}-${nicheCounter}`;
}

describe("runClayPush", () => {
  it("pushes only unpushed rows", async () => {
    const niche = uniqueNiche("unpushed");
    await seedCompanies(niche, [
      { slug: "a" },
      { slug: "b" },
      { slug: "c", pushed: true },
    ]);

    const fetchImpl = okFetch();
    const result = await runClayPush({ niche: [niche] }, { fetchImpl });

    expect(result.total_matched).toBe(3);
    expect(result.already_pushed).toBe(1);
    expect(result.total_found).toBe(2);
    expect(result.pushed).toBe(2);
    expect(result.errors).toBe(0);

    const { data } = await supabaseAdmin
      .from("companies")
      .select("domain,pushed_to_clay,pushed_to_clay_at")
      .in("domain", [testDomain(niche, "a"), testDomain(niche, "b")]);

    expect(data).toHaveLength(2);
    for (const row of data ?? []) {
      expect(row.pushed_to_clay).toBe(true);
      expect(row.pushed_to_clay_at).not.toBeNull();
    }
  });

  it("does not abort the batch on a webhook failure", async () => {
    const niche = uniqueNiche("partial-fail");
    await seedCompanies(niche, [{ slug: "ok1" }, { slug: "bad" }, { slug: "ok2" }]);

    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse((init?.body as string) ?? "{}");
      if (body.domain === testDomain(niche, "bad")) {
        return { ok: false, status: 500 } as Response;
      }
      return { ok: true } as Response;
    }) as unknown as typeof fetch;

    const result = await runClayPush({ niche: [niche] }, { fetchImpl });

    expect(result.total_found).toBe(3);
    expect(result.pushed).toBe(2);
    expect(result.errors).toBe(1);
    expect(result.failed_companies).toContain(`Clay Test bad`);

    const { data } = await supabaseAdmin
      .from("companies")
      .select("pushed_to_clay")
      .eq("domain", testDomain(niche, "bad"))
      .single();

    expect(data?.pushed_to_clay).toBe(false);
  });

  it("is idempotent — a second run finds nothing left to push", async () => {
    const niche = uniqueNiche("idempotent");
    await seedCompanies(niche, [{ slug: "a" }, { slug: "b" }]);

    const first = await runClayPush({ niche: [niche] }, { fetchImpl: okFetch() });
    expect(first.pushed).toBe(2);

    const secondFetch = okFetch();
    const second = await runClayPush({ niche: [niche] }, { fetchImpl: secondFetch });

    expect(second.total_found).toBe(0);
    expect(second.pushed).toBe(0);
    expect(secondFetch).not.toHaveBeenCalled();
  });

  it("returns an all-zero result for an empty filter match", async () => {
    const niche = uniqueNiche("empty");
    const fetchImpl = okFetch();

    const result = await runClayPush({ niche: [niche] }, { fetchImpl });

    expect(result).toEqual({
      total_matched: 0,
      already_pushed: 0,
      total_found: 0,
      pushed: 0,
      errors: 0,
      failed_companies: [],
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects when CLAY_WEBHOOK_URL is not configured", async () => {
    const original = process.env.CLAY_WEBHOOK_URL;
    delete process.env.CLAY_WEBHOOK_URL;

    try {
      await expect(runClayPush({ niche: [uniqueNiche("no-config")] })).rejects.toThrow(
        "CLAY_WEBHOOK_URL is not configured"
      );
    } finally {
      if (original !== undefined) process.env.CLAY_WEBHOOK_URL = original;
    }
  });

  it("caps failed_companies at FAILED_PREVIEW", async () => {
    const niche = uniqueNiche("many-failures");
    const count = FAILED_PREVIEW + 5;
    await seedCompanies(
      niche,
      Array.from({ length: count }, (_, i) => ({ slug: `fail-${i}` }))
    );

    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 400 }) as unknown as typeof fetch;
    const result = await runClayPush({ niche: [niche] }, { fetchImpl });

    expect(result.errors).toBe(count);
    expect(result.failed_companies).toHaveLength(FAILED_PREVIEW);
  });
});

describe("resolveClayPushCounts", () => {
  it("reports matched vs eligible counts without pushing anything", async () => {
    const niche = uniqueNiche("preflight");
    await seedCompanies(niche, [{ slug: "a" }, { slug: "b", pushed: true }]);

    const counts = await resolveClayPushCounts({ niche: [niche] });

    expect(counts.total_matched).toBe(2);
    expect(counts.eligible).toBe(1);
  });
});
