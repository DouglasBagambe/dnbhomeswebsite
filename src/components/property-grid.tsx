import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/types/property";

export function PropertyGrid({ properties, compact = false }: { properties: Property[]; compact?: boolean }) {
  return <div className={`property-grid ${compact ? "results-grid" : ""}`}>{properties.map((property) => <PropertyCard key={property._id} property={property} compact={compact} />)}</div>;
}
