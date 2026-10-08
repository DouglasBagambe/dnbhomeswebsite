export type Purpose = "rent" | "sale" | "short_stay";
export type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "hotel"
  | "guest_house"
  | "serviced_apartment"
  | "other";

export interface Media {
  url: string;
  type: "image" | "video";
  alt?: string;
  width?: number;
  height?: number;
}

export interface Agency {
  _id: string;
  name: string;
  slug?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  verificationStatus?: string;
  description?: string;
  listingCount?: number;
  listings?: Property[];
  agents?: Agent[];
}

export interface Agent {
  _id: string;
  name: string;
  slug?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  verificationStatus?: string;
  agency?: Agency;
  listingCount?: number;
  listings?: Property[];
}

export interface Property {
  _id: string;
  slug: string;
  title: string;
  description: string;
  purpose: Purpose;
  type: PropertyType;
  price: { amount: number; currency: "UGX" | "USD"; period: "total" | "month" | "week" | "night" };
  location: {
    country: string;
    region: string;
    district: string;
    area: string;
    address: string;
    coordinates?: { type: "Point"; coordinates: [number, number] };
  };
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit: "sqm" | "sqft" | "acres" | "hectares";
  amenities: string[];
  tags: string[];
  media: Media[];
  cover?: Media;
  agent?: Agent;
  agency?: Agency;
  featured: boolean;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  status: "published";
  publishedAt?: string;
  updatedAt?: string;
  viewCount: number;
}

export interface PropertyPage {
  data: Property[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface Booking {
  _id: string;
  reference: string;
  property: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "no_show";
  createdAt: string;
}

export interface DirectoryPage<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
