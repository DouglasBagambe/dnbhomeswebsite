import type { ListingQuery } from "@/lib/query";

export interface PurposePageConfig { title: string; eyebrow: string; description: string; query: Partial<ListingQuery>; path: string; }
export const purposePages = {
  buy: { title: "Property for sale", eyebrow: "Buy with clarity", description: "Explore published houses, apartments and other property for sale across Uganda.", query: { purpose: "sale" }, path: "/buy" },
  rent: { title: "Homes for rent", eyebrow: "Find your next home", description: "Browse long-term rental homes with clear prices, locations and representative details.", query: { purpose: "rent" }, path: "/rent" },
  "short-stay": { title: "Short stays", eyebrow: "Flexible places to stay", description: "Discover short-stay properties and request availability directly from their representative.", query: { purpose: "short_stay" }, path: "/short-stay" },
  land: { title: "Land for sale and rent", eyebrow: "Explore land", description: "Browse published land inventory, with size and location details where supplied.", query: { type: "land" }, path: "/land" },
  commercial: { title: "Commercial property", eyebrow: "Space for business", description: "Find published offices, retail and other commercial property across Uganda.", query: { type: "commercial" }, path: "/commercial" },
} satisfies Record<string, PurposePageConfig>;
