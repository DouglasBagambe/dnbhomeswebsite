import Image from "next/image";
import Link from "next/link";
import { CompareButton } from "@/components/compare-provider";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, locationLabel, propertyPath, titleCase } from "@/lib/format";
import { imageFor } from "@/lib/storage";
import type { Property } from "@/types/property";

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const image = imageFor(property);
  const facts = [property.bedrooms !== undefined ? `${property.bedrooms} beds` : "", property.bathrooms !== undefined ? `${property.bathrooms} baths` : "", property.size ? `${property.size} ${property.sizeUnit}` : ""].filter(Boolean).join(" · ");
  return <article className={`card property-card ${compact ? "compact" : ""}`}>
    <FavoriteButton id={property._id} />
    <Link className="property-image" href={propertyPath(property)} aria-label={`View ${property.title}`}>
      {image ? <Image src={image} alt={property.cover?.alt || property.title} fill sizes="(max-width: 520px) 100vw, (max-width: 1024px) 50vw, 33vw" /> : <div className="image-placeholder">Homes property</div>}
    </Link>
    <div className="property-body">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><span className="price">{formatPrice(property.price)}</span>{property.verificationStatus === "verified" && <span className="badge">Verified</span>}</div>
      <h3><Link href={propertyPath(property)}>{property.title}</Link></h3>
      <div className="muted">{titleCase(property.type)} · {locationLabel(property)}</div>
      {facts && <div className="facts">{facts}</div>}
      <CompareButton property={property} />
    </div>
  </article>;
}
