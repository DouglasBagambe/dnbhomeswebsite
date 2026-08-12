import Link from "next/link";
import { PropertyGrid } from "@/components/property-grid";
import { EmptyState, ErrorState } from "@/components/states";
import { getProperties } from "@/lib/api";
import { toSearchParams } from "@/lib/query";
import type { PurposePageConfig } from "@/lib/purpose";

export async function PurposePage({ config }: { config: PurposePageConfig }) {
  let result; try { result = await getProperties({ ...config.query, limit: 12, sort: "newest" }); } catch { result = null; }
  const discover = `/discover?${toSearchParams(config.query)}`;
  return <><section className="page-hero"><div className="container"><span className="eyebrow">{config.eyebrow}</span><h1>{config.title} in Uganda</h1><p className="muted">{config.description}</p><form className="purpose-search market-toolbar" action="/discover"><input name="q" aria-label="Location or keyword" placeholder="Search an area or property" />{Object.entries(config.query).map(([key, value]) => <input key={key} type="hidden" name={key} value={String(value)} />)}<select name="bedrooms" aria-label="Bedrooms" defaultValue=""><option value="">Any bedrooms</option><option value="1">1+ bedroom</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option><option value="4">4+ bedrooms</option></select><button className="button" type="submit">Search</button></form></div></section><section className="section-tight purpose-results"><div className="container"><div className="section-heading"><div><h2>Available properties</h2><p className="muted">{result ? `${result.pagination.total} published ${result.pagination.total === 1 ? "property" : "properties"}` : "Live Homes inventory"}</p></div><Link className="text-link" href={discover}>View all</Link></div>{result ? result.data.length ? <PropertyGrid properties={result.data} /> : <EmptyState /> : <ErrorState />}</div></section></>;
}
