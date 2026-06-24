import { describe, expect, it } from "vitest";
import { getOverview } from "@/lib/data/overview";

describe("getOverview", () => {
  it("returns real totals and sorted breakdowns from live Supabase data", async () => {
    const overview = await getOverview();

    expect(overview.totalCompanies).toBeGreaterThan(0);
    expect(overview.totalPeople).toBeGreaterThan(0);

    expect(overview.niches.length).toBeGreaterThan(0);
    expect(overview.sources.length).toBeGreaterThan(0);

    for (const list of [overview.niches, overview.sources]) {
      for (let i = 1; i < list.length; i++) {
        expect(list[i - 1].count).toBeGreaterThanOrEqual(list[i].count);
      }
    }

    // source tokens must be normalized — raw delimited/variant strings never appear
    const sourceIds = overview.sources.map((s) => s.id);
    expect(sourceIds).not.toContain("aiark-api");
    expect(sourceIds).not.toContain("aiark-people");
    expect(sourceIds.some((id) => id.includes(","))).toBe(false);
    expect(sourceIds.some((id) => id.includes("&"))).toBe(false);

    // every normalized count should be <= total companies
    for (const entry of overview.sources) {
      expect(entry.count).toBeLessThanOrEqual(overview.totalCompanies);
    }
    for (const entry of overview.niches) {
      expect(entry.count).toBeLessThanOrEqual(overview.totalCompanies);
    }
  }, 30000);
});
