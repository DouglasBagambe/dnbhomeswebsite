import type { Property } from "@/types/property";

export const FAVORITES_KEY = "homes:favorites:v1";
export const COMPARE_KEY = "homes:compare:v1";
export const BOOKINGS_KEY = "homes:bookings:v1";
export const RECENT_SEARCHES_KEY = "homes:recent-searches:v1";

export function readIds(storage: Pick<Storage, "getItem">, key: string): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

export function toggleId(ids: string[], id: string, limit?: number): string[] {
  if (ids.includes(id)) return ids.filter((value) => value !== id);
  if (limit && ids.length >= limit) return ids;
  return [...ids, id];
}

export interface LocalBooking {
  propertyId: string;
  propertyTitle: string;
  reference: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
}

export function imageFor(property: Property): string | undefined {
  return property.cover?.url || property.media.find((media) => media.type === "image")?.url;
}
