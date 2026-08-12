import { describe, expect, it, vi } from "vitest";
import { bookingSchema, toBookingPayload } from "@/lib/booking";

describe("viewing request validation", () => {
  it("accepts complete contact details", () => { const input = bookingSchema.parse({ property: "abc", propertyTitle: "Home", guestName: "Amina K", guestEmail: "amina@example.com", guestPhone: "+256700000000", date: "2030-01-02", time: "10:30", notes: "Morning please" }); expect(toBookingPayload(input)).toMatchObject({ property: "abc", guestEmail: "amina@example.com" }); });
  it("rejects invalid contact and past requests", () => { expect(bookingSchema.safeParse({}).success).toBe(false); vi.setSystemTime(new Date("2030-01-02T12:00:00Z")); const input = bookingSchema.parse({ property: "abc", propertyTitle: "Home", guestName: "Amina K", guestEmail: "amina@example.com", guestPhone: "+256700000000", date: "2030-01-01", time: "10:30" }); expect(() => toBookingPayload(input)).toThrow("future"); vi.useRealTimers(); });
});
