import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/types/property";

export function PropertyGrid({ properties }: { properties: Property[] }) {
  return <div className="property-grid">{properties.map((property) => <PropertyCard key={property._id} property={property} />)}</div>;
}
