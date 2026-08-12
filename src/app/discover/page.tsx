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
  return <><section className="page-hero"><div className="container"><span className="eyebrow">Live property search</span><h1>Discover a place that fits.</h1><p className="muted">Search and filter published Homes inventory. Your search stays in the URL so it is easy to share.</p></div></section><section className="section-tight"><div className="container filter-layout"><FilterPanel query={query} /><div><div className="results-top"><div><strong>{failed ? "Properties unavailable" : `${result.pagination.total} ${result.pagination.total === 1 ? "property" : "properties"}`}</strong>{!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && <div className="muted" style={{ fontSize: ".82rem" }}>Map view unavailable; list results remain fully functional.</div>}</div><SortSelect value={query.sort} /></div>{active.length > 0 && <div className="chips" aria-label="Active filters">{active.map(([key, value]) => <span className="chip" key={key}>{titleCase(key)}: {String(value)}</span>)}</div>}{failed ? <ErrorState /> : result.data.length ? <PropertyGrid properties={result.data} /> : <EmptyState />}{result.pagination.pages > 1 && <nav className="pagination" aria-label="Results pages">{query.page > 1 && <Link className="button secondary" href={pageHref(query.page - 1)}>Previous</Link>}<span style={{ alignSelf: "center" }}>Page {query.page} of {result.pagination.pages}</span>{query.page < result.pagination.pages && <Link className="button secondary" href={pageHref(query.page + 1)}>Next</Link>}</nav>}</div></div></section></>;
}
