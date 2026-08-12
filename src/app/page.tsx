import Image from "next/image";
import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { ListingSection } from "@/components/section";
import { getProperties } from "@/lib/api";
import { imageFor } from "@/lib/storage";
import type { PropertyPage } from "@/types/property";

const safe = async (query: Parameters<typeof getProperties>[0]): Promise<PropertyPage> => {
  try { return await getProperties(query); } catch { return { data: [], pagination: { page: 1, limit: 6, total: 0, pages: 0 } }; }
};

export default async function HomePage() {
  const [featured, popular, latest] = await Promise.all([
    safe({ featured: "true", limit: 6 }), safe({ sort: "popular", limit: 6 }), safe({ sort: "newest", limit: 6 }),
  ]);
  const heroProperty = featured.data[0] ?? latest.data[0];
  const heroImage = heroProperty ? imageFor(heroProperty) : undefined;
  const locations = [...new Set([...featured.data, ...popular.data, ...latest.data].map((property) => property.location.area || property.location.district).filter(Boolean))].slice(0, 8);
  return <>
    <section className="hero">{heroImage && <Image className="hero-media" src={heroImage} alt="" fill priority sizes="100vw" />}<div className="container hero-content"><div className="hero-copy"><span className="eyebrow" style={{ color: "#b7e2cc" }}>Property discovery in Uganda</span><h1>Find a place you can trust.</h1><p>Explore homes, land, commercial property and short stays with clear details and safer viewing requests.</p></div></div></section>
    <HomeSearch />
    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Start exploring</span><h2>What are you looking for?</h2></div></div><div className="category-grid">{[
      ["Rent", "/rent", "Long-term homes"], ["Buy", "/buy", "Property for sale"], ["Short Stay", "/short-stay", "Flexible stays"], ["Land", "/land", "Plots and acreage"], ["Commercial", "/commercial", "Work and business spaces"],
    ].map(([label, href, note]) => <Link className="card category" key={href} href={href}><strong>{label}</strong><span>{note}</span></Link>)}</div></div></section>
    <ListingSection title="Featured properties" subtitle="Selected from currently published Homes inventory." properties={featured.data} href="/discover?featured=true" />
    <ListingSection title="Popular right now" subtitle="Properties receiving the most views." properties={popular.data} href="/discover?sort=popular" />
    <section className="section-tight"><div className="container"><div className="section-heading"><div><h2>Popular locations</h2><p className="muted">Browse locations represented in current inventory.</p></div></div>{locations.length ? <div className="locations">{locations.map((location) => <Link className="location-pill" key={location} href={`/locations/uganda/${encodeURIComponent(location.toLowerCase().replaceAll(" ", "-"))}`}>{location}</Link>)}</div> : <p className="muted">Locations will appear as inventory becomes available.</p>}</div></section>
    <ListingSection title="Trending properties" subtitle="Actual inventory ordered by listing views." properties={popular.data} href="/discover?sort=popular" />
    <ListingSection title="Latest listings" subtitle="Recently published property inventory." properties={latest.data} href="/discover?sort=newest" />
    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Safer discovery</span><h2>Trust is built into the journey</h2></div><Link className="text-link" href="/safety">Read safety guidance</Link></div><div className="trust-grid">{[
      ["Verified where confirmed", "Verification is shown only when a listing or representative has passed the relevant Homes review."], ["Real representatives", "Contact details appear only when supplied with the published property."], ["Clear viewing requests", "A request is pending until the representative confirms it. Homes never labels a request confirmed prematurely."], ["Scam awareness", "Practical reminders help you verify property details before sending money or sharing sensitive information."],
    ].map(([title, copy]) => <div className="trust-item" key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></div></section>
    <section className="section"><div className="container card app-banner"><div><span className="eyebrow" style={{ color: "#9ad7b9" }}>Homes for Android</span><h2>Keep your property search close.</h2><p>Save properties, compare details and request viewings from the Homes Android app.</p><Link className="button" href="/download">Android app details</Link></div><div className="phone-art">dnb<br />Homes</div></div></section>
  </>;
}
