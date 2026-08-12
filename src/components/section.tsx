import Link from "next/link";
import { PropertyGrid } from "@/components/property-grid";
import { EmptyState } from "@/components/states";
import type { Property } from "@/types/property";

export function ListingSection({ title, subtitle, properties, href = "/discover" }: { title: string; subtitle?: string; properties: Property[]; href?: string }) {
  return <section className="section"><div className="container"><div className="section-heading"><div><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div><Link className="text-link" href={href}>See all homes</Link></div>{properties.length ? <PropertyGrid properties={properties.slice(0, 4)} /> : <EmptyState />}</div></section>;
}
