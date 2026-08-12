import { describe, expect, it } from "vitest";
import { formatPrice, locationLabel } from "@/lib/format";
import type { Property } from "@/types/property";

const property = { title: "Calm family home", location: { area: "Ntinda", district: "Kampala" }, price: { amount: 1500000, currency: "UGX", period: "month" }, verificationStatus: "verified" } as Property;
describe("property card content contract", () => { it("prioritizes real price, location and verification", () => { expect(formatPrice(property.price)).toBe("UGX 1,500,000 / month"); expect(locationLabel(property)).toBe("Ntinda, Kampala"); expect(property.verificationStatus === "verified").toBe(true); }); });
