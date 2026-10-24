import type { Media, Property, PropertyPage } from "@/types/property";

export interface TourPlace { area: string; district: string }
export interface ToursPage { data: Property[]; nextPage: number | null; locations: TourPlace[] }
export function safeTourUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export function tourMedia(property: Property): Media[] {
  const seen = new Set<string>();
  return [...property.media.filter(m => m.type === "video"), ...property.media.filter(m => m.type === "image")]
    .filter(m => safeTourUrl(m.url) && !seen.has(m.url) && Boolean(seen.add(m.url)));
}
export function tourProperties(properties: Property[]): Property[] {
  return properties.filter(p => p.status === "published" && tourMedia(p).some(m => m.type === "video"));
}
export function tourCover(property: Property): string | undefined {
  const cover = property.cover?.type === "image" ? property.cover : property.media.find(m => m.type === "image");
  return cover && safeTourUrl(cover.url) ? cover.url : undefined;
}

export async function scanTours(fetchPage: (query: { page: number; limit: number; sort: "popular"; area?: string; district?: string }) => Promise<PropertyPage>, page: number, area: string, district: string): Promise<ToursPage> {
  const locations = new Map<string, { area: string; district: string }>();
  let nextPage: number | null = page;
  const data: ToursPage["data"] = [];
  for (let scan = 0; scan < 4 && nextPage !== null; scan++) {
    const result = await fetchPage({ page: nextPage, limit: 50, sort: "popular", ...(area ? { area } : {}), ...(district ? { district } : {}) });
    for (const property of result.data) {
      const place = { area: property.location.area, district: property.location.district };
      if (place.area || place.district) locations.set(`${place.area}|${place.district}`, place);
    }
    data.push(...tourProperties(result.data));
    nextPage = result.pagination.page < result.pagination.pages ? result.pagination.page + 1 : null;
    if (data.length) break;
  }
  // Mix each real inventory batch without pretending there is a personalised ranking system.
  for (let i = data.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [data[i], data[j]] = [data[j], data[i]]; }
  return { data, nextPage, locations: [...locations.values()] };
}
