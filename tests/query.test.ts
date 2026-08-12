import { describe, expect, it } from "vitest";
import { parseListingQuery, toSearchParams } from "@/lib/query";

describe("listing query", () => {
  it("parses supported URL filters", () => { const result = parseListingQuery({ purpose: "rent", bedrooms: "2", maxPrice: "1500000", sort: "price_asc", ignored: "no" }); expect(result).toMatchObject({ purpose: "rent", bedrooms: 2, maxPrice: 1500000, sort: "price_asc" }); expect(toSearchParams(result).has("ignored")).toBe(false); });
  it("falls back safely for invalid values", () => { expect(parseListingQuery({ purpose: "fake", page: "-2" })).toMatchObject({ page: 1, limit: 20, sort: "newest" }); });
});
