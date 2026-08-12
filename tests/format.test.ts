import { describe, expect, it } from "vitest";
import { formatPrice, idFromSlugAndId, propertyPath } from "@/lib/format";

describe("format helpers", () => {
  it("formats Uganda-first prices and periods", () => { expect(formatPrice({ amount: 1500000, currency: "UGX", period: "month" })).toBe("UGX 1,500,000 / month"); });
  it("creates and parses canonical property paths", () => { const id = "64d000000000000000000001"; expect(propertyPath({ slug: "calm-home", _id: id })).toBe(`/properties/calm-home-${id}`); expect(idFromSlugAndId(`calm-home-${id}`)).toBe(id); });
});
