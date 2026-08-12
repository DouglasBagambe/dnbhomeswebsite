import type { Metadata } from "next";
import Link from "next/link";
import { FilterPanel } from "@/components/filter-panel";
import { PropertyGrid } from "@/components/property-grid";
import { SortSelect } from "@/components/sort-select";
import { EmptyState, ErrorState } from "@/components/states";
import { getProperties } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { parseListingQuery, toSearchParams } from "@/lib/query";
import { titleCase } from "@/lib/format";

export const metadata: Metadata = pageMetadata("Discover property", "Search live Homes property inventory across Uganda.", "/discover", true);
type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoverPage({ searchParams }: { searchParams: Search }) {
  const query = parseListingQuery(await searchParams);
  let result; let failed = false;
  try { result = await getProperties(query); } catch { failed = true; result = { data: [], pagination: { page: query.page, limit: query.limit, total: 0, pages: 0 } }; }
  const active = Object.entries(query).filter(([key, value]) => !["page", "limit", "sort"].includes(key) && value !== undefined && value !== "");
  const pageHref = (page: number) => { const params = toSearchParams({ ...query, page }); return `/discover?${params}`; };
  const place = query.area || query.district || query.region || query.country || "Uganda";
  return <><section className="page-hero discover-hero"><div className="container"><span className="eyebrow">Discover</span><h1>Property across Uganda</h1><p className="muted">Filter published Homes inventory and share any search using its URL.</p></div></section><section className="section-tight discover-results"><div className="container filter-layout"><FilterPanel query={query} /><div><div className="results-top"><div><strong>{failed ? "Properties unavailable" : `${result.pagination.total} ${result.pagination.total === 1 ? "home" : "homes"} in ${place}`}</strong>{!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && <div className="muted" style={{ fontSize: ".82rem" }}>List view shown · map available when configured</div>}</div><SortSelect value={query.sort} /></div>{active.length > 0 && <div className="chips" aria-label="Active filters">{active.map(([key, value]) => <span className="chip" key={key}>{titleCase(key)}: {String(value)}</span>)}</div>}{failed ? <ErrorState /> : result.data.length ? <PropertyGrid properties={result.data} compact /> : <EmptyState />}{result.pagination.pages > 1 && <nav className="pagination" aria-label="Results pages">{query.page > 1 && <Link className="button secondary" href={pageHref(query.page - 1)}>Previous</Link>}<span style={{ alignSelf: "center" }}>Page {query.page} of {result.pagination.pages}</span>{query.page < result.pagination.pages && <Link className="button secondary" href={pageHref(query.page + 1)}>Next</Link>}</nav>}</div></div></section></>;
}
