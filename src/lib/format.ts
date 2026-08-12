import type { Property } from "@/types/property";

export function formatPrice(price: Property["price"]): string {
  const amount = new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(price.amount);
  const period = price.period === "total" ? "" : ` / ${price.period}`;
  return `${price.currency} ${amount}${period}`;
}

export const titleCase = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function propertyPath(property: Pick<Property, "slug" | "_id">): string {
  return `/properties/${property.slug}-${property._id}`;
}

export function idFromSlugAndId(value: string): string {
  const match = value.match(/([a-f\d]{24})$/i);
  return match?.[1] ?? value;
}

export const locationLabel = (property: Property): string =>
  [property.location.area, property.location.district]
    .filter(Boolean)
    .join(", ");
