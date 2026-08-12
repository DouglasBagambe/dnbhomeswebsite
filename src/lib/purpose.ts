import type { ListingQuery } from "@/lib/query";

export interface PurposePageConfig { title: string; eyebrow: string; description: string; query: Partial<ListingQuery>; path: string; }
export const purposePages = {
  buy: { title: "Property for sale", eyebrow: "Buy", description: "Explore houses, apartments and other property for sale with clear details.", query: { purpose: "sale" }, path: "/buy" },
  rent: { title: "Homes for rent", eyebrow: "Rent", description: "Browse long-term rentals with clear prices, locations and representative details.", query: { purpose: "rent" }, path: "/rent" },
  "short-stay": { title: "Short stays", eyebrow: "Short Stay", description: "Discover flexible stays and request availability from the representative.", query: { purpose: "short_stay" }, path: "/short-stay" },
  land: { title: "Land", eyebrow: "Land", description: "Browse plots and acreage with size and location details where supplied.", query: { type: "land" }, path: "/land" },
  commercial: { title: "Commercial property", eyebrow: "Commercial", description: "Find offices, retail and other business spaces across Uganda.", query: { type: "commercial" }, path: "/commercial" },
} satisfies Record<string, PurposePageConfig>;
