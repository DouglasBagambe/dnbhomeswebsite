import type { Metadata } from "next";
import { config } from "@/lib/config";
import type { Property } from "@/types/property";
import { formatPrice, locationLabel, propertyPath } from "@/lib/format";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  noIndex = false,
): Metadata {
  const canonical = `${config.siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical, siteName: "Homes", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function propertyMetadata(property: Property): Metadata {
  const title = `${property.title} | Homes`;
  const description = `${formatPrice(property.price)} · ${locationLabel(property)}. ${property.description}`.slice(0, 155);
  const url = `${config.siteUrl}${propertyPath(property)}`;
  const image = property.cover?.url ?? property.media.find((item) => item.type === "image")?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}
