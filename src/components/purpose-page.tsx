import Link from "next/link";
import { PropertyGrid } from "@/components/property-grid";
import { EmptyState, ErrorState } from "@/components/states";
import { getProperties } from "@/lib/api";
import { toSearchParams } from "@/lib/query";
import type { PurposePageConfig } from "@/lib/purpose";

export async function PurposePage({ config }: { config: PurposePageConfig }) {
  let result; try { result = await getProperties({ ...config.query, limit: 12, sort: "newest" }); } catch { result = null; }
  const discover = `/discover?${toSearchParams(config.query)}`;
  return <><section className="page-hero"><div className="container"><span className="eyebrow">{config.eyebrow}</span><h1>{config.title}</h1><p className="muted">{config.description}</p><Link className="button" href={discover}>Search with filters</Link></div></section><section className="section-tight"><div className="container"><div className="section-heading"><div><h2>Latest available properties</h2><p className="muted">Live published inventory from Homes.</p></div><Link className="text-link" href={discover}>View all</Link></div>{result ? result.data.length ? <PropertyGrid properties={result.data} /> : <EmptyState /> : <ErrorState />}</div></section></>;
}
