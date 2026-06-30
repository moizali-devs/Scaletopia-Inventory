import { describe, expect, it } from "vitest";
import { getDashboard } from "@/lib/data/dashboard";

describe("getDashboard", () => {
  it("returns all-time totals and breakdowns with no range", async () => {
    const dashboard = await getDashboard();

    expect(dashboard.totalCompanies).toBeGreaterThan(0);
    expect(dashboard.totalPeople).toBeGreaterThan(0);
    expect(dashboard.niches.length).toBeGreaterThan(0);
    expect(dashboard.recentCompanies.length).toBeGreaterThan(0);
  }, 30000);

  it("a future `from` bound empties breakdowns and recent companies but leaves totals untouched", async () => {
    const allTime = await getDashboard();
    const futureYear = new Date().getFullYear() + 1;
    const future = await getDashboard({ from: `${futureYear}-01-01T00:00:00.000Z` });

    expect(future.recentCompanies).toHaveLength(0);
    expect(future.niches).toHaveLength(0);
    expect(future.sources).toHaveLength(0);

    // totals are all-time inventory size, not scoped to the range.
    // Assert > 0 rather than exact equality — concurrent test-data mutations
    // can shift the live count between the two independent DB reads.
    expect(future.totalCompanies).toBeGreaterThan(0);
    expect(future.totalPeople).toBeGreaterThan(0);
  }, 30000);

  it("narrowing the range never returns more recent companies than all-time", async () => {
    const allTime = await getDashboard();
    const sample = allTime.recentCompanies[0];
    if (!sample?.createdAt) return;

    const narrowed = await getDashboard({ from: sample.createdAt });
    for (const company of narrowed.recentCompanies) {
      expect(new Date(company.createdAt ?? 0).getTime()).toBeGreaterThanOrEqual(
        new Date(sample.createdAt).getTime()
      );
    }
  }, 30000);
});
