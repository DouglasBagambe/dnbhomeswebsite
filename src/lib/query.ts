import { z } from "zod";

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const allowed = [
  "q", "purpose", "type", "country", "region", "district", "area",
  "minPrice", "maxPrice", "bedrooms", "bathrooms", "amenities", "featured",
  "verified", "latitude", "longitude", "radius", "page", "limit", "sort",
] as const;

const schema = z.object({
  q: z.string().trim().max(100).optional(),
  purpose: z.enum(["rent", "sale", "short_stay"]).optional(),
  type: z.enum(["apartment", "house", "land", "commercial", "hotel", "guest_house", "serviced_apartment", "other"]).optional(),
  country: z.string().trim().max(80).optional(),
  region: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  area: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).max(30).optional(),
  bathrooms: z.coerce.number().int().min(0).max(30).optional(),
  amenities: z.string().trim().max(300).optional(),
  featured: z.enum(["true", "false"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc", "popular"]).default("newest"),
});

export type ListingQuery = z.infer<typeof schema>;

export function parseListingQuery(
  input: Record<string, string | string[] | undefined>,
  defaults: Partial<ListingQuery> = {},
): ListingQuery {
  const selected = Object.fromEntries(
    allowed.map((key) => [key, first(input[key])]).filter(([, value]) => value !== undefined && value !== ""),
  );
  const parsed = schema.safeParse({ ...defaults, ...selected });
  return parsed.success ? parsed.data : schema.parse(defaults);
}

export function toSearchParams(query: Partial<ListingQuery>): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of allowed) {
    const value = query[key];
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params;
}
