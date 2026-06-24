import { describe, expect, it } from "vitest";
import { normalizeCountry } from "@/lib/data/country";

describe("normalizeCountry", () => {
  it("collapses US synonyms and casing variants", () => {
    expect(normalizeCountry("US")).toEqual({ id: "US", label: "United States" });
    expect(normalizeCountry("United States")).toEqual({ id: "US", label: "United States" });
    expect(normalizeCountry("united states")).toEqual({ id: "US", label: "United States" });
  });

  it("collapses UK synonyms", () => {
    expect(normalizeCountry("GB")).toEqual({ id: "GB", label: "United Kingdom" });
    expect(normalizeCountry("United Kingdom")).toEqual({ id: "GB", label: "United Kingdom" });
  });

  it("collapses Canada synonyms", () => {
    expect(normalizeCountry("CA")).toEqual({ id: "CA", label: "Canada" });
    expect(normalizeCountry("canada")).toEqual({ id: "CA", label: "Canada" });
  });

  it("title-cases unknown countries without an alias", () => {
    expect(normalizeCountry("spain")).toEqual({ id: "SPAIN", label: "Spain" });
  });

  it("returns null for empty/null/undefined", () => {
    expect(normalizeCountry(null)).toBeNull();
    expect(normalizeCountry(undefined)).toBeNull();
    expect(normalizeCountry("  ")).toBeNull();
  });
});
