import type { Metadata } from "next";
import { DiscoveryLink as Link } from "@/components/discovery-link";
import { FilterPanel } from "@/components/filter-panel";
import { DiscoverExperience } from "@/components/discover-experience";
import { SortSelect } from "@/components/sort-select";
import { EmptyState, ErrorState } from "@/components/states";
import { getProperties } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { parseListingQuery, toSearchParams } from "@/lib/query";
import { titleCase } from "@/lib/format";

export const metadata: Metadata = pageMetadata("Discover property", "Search live Homes property inventory across Uganda.", "/discover", true);
type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoverPage({ searchParams }: { searchParams: Search }) {
  const raw = await searchParams;
  const mode = raw.mode === "swipe" ? "swipe" : "grid";
  const query = parseListingQuery(raw);
  let result; let failed = false;
  try { result = await getProperties(query); } catch { failed = true; result = { data: [], pagination: { page: query.page, limit: query.limit, total: 0, pages: 0 } }; }
  const active = Object.entries(query).filter(([key, value]) => !["page", "limit", "sort"].includes(key) && value !== undefined && value !== "");
  const pageHref = (page: number) => { const params = toSearchParams({ ...query, page }); if (mode === "swipe") params.set("mode", mode); return `/discover?${params}`; };
  const place = query.area || query.district || query.region || query.country || "Uganda";
  return <><section className="page-hero discover-hero"><div className="container"><span className="eyebrow">Discover</span><h1>Property across Uganda</h1><p className="muted">Find the right space. Refine the details that matter to you.</p></div></section><section className="section-tight discover-results"><div className="container filter-layout"><FilterPanel query={query} /><div><div className="results-top"><div><strong>{failed ? "Properties unavailable" : `${result.pagination.total} ${result.pagination.total === 1 ? "home" : "homes"} in ${place}`}</strong></div><SortSelect value={query.sort} /></div>{active.length > 0 && <div className="chips" aria-label="Active filters">{active.map(([key, value]) => <Link className="chip" key={key} href={`/discover?${toSearchParams({ ...query, [key]: undefined, page: 1 })}${mode === "swipe" ? "&mode=swipe" : ""}`} aria-label={`Remove ${titleCase(key)} filter`}>{titleCase(key)}: {String(value)} <span aria-hidden="true">×</span></Link>)}</div>}{failed ? <ErrorState /> : result.data.length ? <DiscoverExperience key={toSearchParams(query).toString()} result={result} queryKey={toSearchParams(query).toString()} /> : <EmptyState />}{result.pagination.pages > 1 && <nav className="pagination" aria-label="Results pages">{query.page > 1 && <Link className="button secondary" href={pageHref(query.page - 1)}>Previous</Link>}<span style={{ alignSelf: "center" }}>Page {query.page} of {result.pagination.pages}</span>{query.page < result.pagination.pages && <Link className="button secondary" href={pageHref(query.page + 1)}>Next</Link>}</nav>}</div></div></section></>;
}
