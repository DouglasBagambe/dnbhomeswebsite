import { PropertyImage } from "@/components/property-image";
import Link from "next/link";
import { CompareButton } from "@/components/compare-provider";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, locationLabel, propertyPath } from "@/lib/format";
import { imageFor } from "@/lib/storage";
import type { Property } from "@/types/property";
import { BadgeCheck } from "lucide-react";

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const image = imageFor(property);
  const facts = [property.bedrooms ? `${property.bedrooms} beds` : "", property.bathrooms ? `${property.bathrooms} baths` : "", property.size ? `${property.size} ${property.sizeUnit}` : ""].filter(Boolean).join(" · ");
  return <article className={`property-card ${compact ? "compact" : ""}`}>
    <FavoriteButton id={property._id} />
    <Link className="property-image" href={propertyPath(property)} aria-label={`View ${property.title}`}>
      {image ? <PropertyImage key={image} src={image} alt={property.cover?.alt || property.title} fill sizes="(max-width: 620px) 100vw, (max-width: 1180px) 50vw, 25vw" /> : <div className="image-placeholder">Homes property</div>}
      <span className="purpose-badge">{property.purpose === "sale" ? "For sale" : property.purpose === "short_stay" ? "Short stay" : "For rent"}</span>
    </Link>
    <div className="property-body">
      <div className="property-price-row"><strong className="price">{formatPrice(property.price)}</strong>{property.verificationStatus === "verified" && <span className="verified-mark" title="Verified listing"><BadgeCheck size={17} /> Verified</span>}</div>
      <h3><Link href={propertyPath(property)}>{property.title}</Link></h3>
      <p className="property-location">{locationLabel(property)}</p>
      {facts && <div className="facts">{facts}</div>}
      <CompareButton property={property} />
    </div>
  </article>;
}
