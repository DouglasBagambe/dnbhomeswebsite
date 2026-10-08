import { expect, it, vi } from "vitest";
import type { Property } from "../src/types/property";
const { getProperties } = vi.hoisted(() => ({ getProperties: vi.fn() }));
vi.mock("../src/lib/api", () => ({ getProperties }));
import sitemap from "../src/app/sitemap";
import { config } from "../src/lib/config";
it("includes later inventory pages and district/area location routes", async () => {
  const property = (id: string, area: string) => ({ _id: id, slug: `home-${id}`, location: { district: "Kampala", area }, updatedAt: "2026-10-01T12:00:00Z" }) as Property;
  getProperties.mockResolvedValueOnce({ data: [property("one", "Ntinda")], pagination: { pages: 2 } }).mockResolvedValueOnce({ data: [property("two", "Bugolobi")], pagination: { pages: 2 } });
  const result = await sitemap();
  expect(getProperties).toHaveBeenCalledWith({ limit: 50, sort: "newest", page: 2 });
  expect(result.some((entry) => entry.url === `${config.siteUrl}/properties/home-two-two`)).toBe(true);
  expect(result.some((entry) => entry.url === `${config.siteUrl}/locations/uganda/kampala/bugolobi`)).toBe(true);
});
