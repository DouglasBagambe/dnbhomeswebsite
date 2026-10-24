import type { Property } from "@/types/property";

export function availabilityLabel(property: Property): string | undefined {
  if (!property.availabilityStatus || property.availabilityStatus === "available") return undefined;
  return ({ rented: "Rented", sold: "Sold", reserved: "Reserved", under_offer: "Under offer", unavailable: "Unavailable" } as Record<string, string>)[property.availabilityStatus] ?? "Unavailable";
}
