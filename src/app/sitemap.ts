import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/api";
import { config } from "@/lib/config";
import { propertyPath } from "@/lib/format";

const staticPaths = ["", "/buy", "/rent", "/short-stay", "/land", "/commercial", "/about", "/safety", "/help", "/contact", "/agents", "/agencies", "/privacy", "/terms", "/download"];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const first = await getProperties({ limit: 50, sort: "newest" }).catch(() => null);
  const data = [...(first?.data ?? [])];
  for (let page = 2; page <= (first?.pagination.pages ?? 0); page++) {
    const result = await getProperties({ limit: 50, sort: "newest", page }).catch(() => null);
    if (!result) break;
    data.push(...result.data);
  }
  const items = { data };
  const properties = items?.data.map((property) => ({ url: `${config.siteUrl}${propertyPath(property)}`, lastModified: property.updatedAt ? new Date(property.updatedAt) : property.publishedAt ? new Date(property.publishedAt) : now, changeFrequency: "weekly" as const, priority: 0.8 })) ?? [];
  const meaningfulLocations = [...new Set(items.data.map((property) => [property.location.district, property.location.area].filter(Boolean).map((part) => encodeURIComponent(part.toLowerCase().replaceAll(" ", "-"))).join("/")).filter(Boolean))].map((location) => ({ url: `${config.siteUrl}/locations/uganda/${location}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...staticPaths.map((path) => ({ url: `${config.siteUrl}${path}`, lastModified: now, changeFrequency: path ? "monthly" as const : "daily" as const, priority: path ? 0.7 : 1 })), ...properties, ...meaningfulLocations];
}
