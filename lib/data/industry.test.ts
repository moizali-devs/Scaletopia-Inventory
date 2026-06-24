import { describe, expect, it } from "vitest";
import { normalizeIndustry } from "@/lib/data/industry";

describe("normalizeIndustry", () => {
  it("collapses casing variants to the same id", () => {
    const a = normalizeIndustry("retail");
    const b = normalizeIndustry("Retail");
    expect(a!.id).toBe(b!.id);
  });

  it("treats ';' and ',' as equivalent separators within the same value", () => {
    const a = normalizeIndustry("Technology; Information and Internet");
    const b = normalizeIndustry("technology, information and internet");
    expect(a!.id).toBe(b!.id);
  });

  it("does not split into multiple tokens (unlike Source)", () => {
    const result = normalizeIndustry("Technology; Information and Internet");
    expect(result!.label).toContain("Technology");
    expect(result!.label).toContain("Internet");
  });

  it("returns null for empty/null/undefined", () => {
    expect(normalizeIndustry(null)).toBeNull();
    expect(normalizeIndustry(undefined)).toBeNull();
    expect(normalizeIndustry("")).toBeNull();
  });
});
