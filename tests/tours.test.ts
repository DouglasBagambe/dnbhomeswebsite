import { describe, it, expect, vi } from "vitest";
import { availabilityLabel } from "../src/lib/availability";
import { safeTourUrl, scanTours, tourMedia, tourProperties } from "../src/lib/tours";
import type { Property, PropertyPage } from "../src/types/property";
const photo = { type: "image" as const, url: "https://media.homes.ug/photo.jpg" };
const video = { type: "video" as const, url: "https://media.homes.ug/video.mp4" };
const home = { _id: "home-1", status: "published", media: [photo, video, video], location: { area: "Ntinda", district: "Kampala" } } as Property;
const page = (number: number, data: Property[], pages = 9): PropertyPage => ({ data, pagination: { page: number, pages, total: 450, limit: 50 } });
describe("Tours feed contract shared with the mobile experience", () => {
  it("accepts secure media, excludes unsafe schemes and credentials", () => {
    expect(safeTourUrl(video.url)).toBe(true);
    for (const value of ["javascript:alert(1)", "http://media.homes.ug/a", "https://user:pass@media.homes.ug/a", "//evil.ug/a", "/\\evil.ug/a"]) expect(safeTourUrl(value)).toBe(false);
  });
  it("keeps only published video properties and puts unique videos before images", () => {
    expect(tourMedia(home)).toEqual([video, photo]);
    expect(tourProperties([home, { ...home, media: [photo] }, { ...home, status: "draft" } as unknown as Property])).toEqual([home]);
  });
  it("bounds sparse inventory to four catalogue requests and exposes an honest continuation", async () => {
    const fetch = vi.fn(async (query: {page: number}) => page(query.page, [{ ...home, media: [photo] }]));
    const result = await scanTours(fetch, 1, "Ntinda", "Kampala");
    expect(fetch).toHaveBeenCalledTimes(4); expect(result.data).toEqual([]); expect(result.nextPage).toBe(5);
    expect(fetch.mock.calls[0][0]).toMatchObject({ area: "Ntinda", district: "Kampala", sort: "popular", limit: 50 });
  });
  it("stops after a real video batch and respects catalogue exhaustion", async () => {
    const fetch = vi.fn(async (query: {page: number}) => page(query.page, query.page === 1 ? [{ ...home, media: [photo] }] : [home], 2));
    const result = await scanTours(fetch, 1, "", "");
    expect(result.data).toEqual([home]); expect(result.nextPage).toBeNull(); expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("preserves availability states and treats unknown states as unavailable", () => {
    expect(availabilityLabel({ ...home, availabilityStatus: "rented" })).toBe("Rented");
    expect(availabilityLabel({ ...home, availabilityStatus: "available" })).toBeUndefined();
    expect(availabilityLabel({ ...home, availabilityStatus: "future-status" } as unknown as Property)).toBe("Unavailable");
  });
});
