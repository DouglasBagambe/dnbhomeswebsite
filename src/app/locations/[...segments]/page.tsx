import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyGrid } from "@/components/property-grid";
import { EmptyState, ErrorState } from "@/components/states";
import { getProperties } from "@/lib/api";
import { config } from "@/lib/config";
import { titleCase } from "@/lib/format";

type Params = Promise<{ segments: string[] }>;
const decode = (value: string) => decodeURIComponent(value).replaceAll("-", " ");

function locationQuery(values: string[]) {
  const [country = "Uganda", second, third, fourth] = values;
  if (values.length === 1) return { country };
  if (values.length === 2) return { country, district: second };
  if (values.length === 3) return { country, district: second, area: third };
  return { country, region: second, district: third, area: fourth };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const rawSegments = (await params).segments;
  const values = rawSegments.map(decode);
  const name = titleCase(values.at(-1) ?? "Uganda");
  const result = values.length > 0 && values.length <= 4
    ? await getProperties({ ...locationQuery(values), limit: 1 }).catch(() => null)
    : null;
  return {
    title: `Property in ${name}`,
    description: `Explore published Homes property inventory in ${name}.`,
    alternates: { canonical: `${config.siteUrl}/locations/${rawSegments.join("/")}` },
    robots: result?.pagination.total ? undefined : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Params }) {
  const values = (await params).segments.map(decode);
  if (!values.length || values.length > 4) notFound();
  const location = values.at(-1) ?? "Uganda";
  const result = await getProperties({ ...locationQuery(values), limit: 20 }).catch(() => null);
  const hasInventory = Boolean(result?.pagination.total);
  return <><section className="page-hero"><div className="container"><span className="eyebrow">Location</span><h1>Property in {titleCase(location)}</h1><p className="muted">{hasInventory ? `${result?.pagination.total} published ${result?.pagination.total === 1 ? "property" : "properties"} currently available.` : !result ? "Inventory is temporarily unavailable. Please try again." : "No published inventory is currently available for this location."}</p>{hasInventory && <div className="locations">{[["Buy", "sale"], ["Rent", "rent"], ["Short Stay", "short_stay"]].map(([label, purpose]) => <Link key={purpose} className="location-pill" href={`/discover?purpose=${purpose}&area=${encodeURIComponent(location)}`}>{label}</Link>)}</div>}</div></section><section className="section-tight"><div className="container">{!result ? <ErrorState /> : result.data.length ? <PropertyGrid properties={result.data} /> : <EmptyState title={`No properties in ${titleCase(location)}`} />}</div></section></>;
}
