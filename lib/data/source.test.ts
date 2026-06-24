import { describe, expect, it } from "vitest";
import { normalizeSourceTokens } from "@/lib/data/source";

describe("normalizeSourceTokens", () => {
  it("splits on comma (companies format)", () => {
    expect(normalizeSourceTokens("aiark-api,blitz-api")).toEqual(["aiark", "blitz"]);
  });

  it("splits on ampersand (people format)", () => {
    expect(normalizeSourceTokens("blitz & Ai Ark")).toEqual(["blitz", "aiark"]);
  });

  it("collapses provider aliases across both tables into one canonical token", () => {
    expect(normalizeSourceTokens("aiark-api")).toEqual(["aiark"]);
    expect(normalizeSourceTokens("aiark-people")).toEqual(["aiark"]);
    expect(normalizeSourceTokens("Ai Ark")).toEqual(["aiark"]);
  });

  it("dedupes repeated tokens within one value", () => {
    expect(normalizeSourceTokens("aiark-api,aiark-api,blitz-api")).toEqual(["aiark", "blitz"]);
  });

  it("keeps distinct apollo variants separate", () => {
    expect(normalizeSourceTokens("apollo")).toEqual(["apollo"]);
    expect(normalizeSourceTokens("apollo-scraped")).toEqual(["apollo-scraped"]);
  });

  it("returns an empty array for null/empty input", () => {
    expect(normalizeSourceTokens(null)).toEqual([]);
    expect(normalizeSourceTokens("")).toEqual([]);
  });
});
