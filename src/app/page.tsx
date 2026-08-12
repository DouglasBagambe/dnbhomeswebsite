import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { HomeSearch } from "@/components/home-search";
import { ListingSection } from "@/components/section";
import { getProperties } from "@/lib/api";
import { bypassImageOptimization, imageFor } from "@/lib/storage";
import type { PropertyPage } from "@/types/property";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=82",
];

const CATEGORY_IMAGES = {
  rent: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=82",
  buy: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=82",
  shortStay: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=82",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=82",
  commercial: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=82",
} as const;

const HERO_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=86";

const safe = async (query: Parameters<typeof getProperties>[0]): Promise<PropertyPage> => {
  try { return await getProperties(query); } catch { return { data: [], pagination: { page: 1, limit: 8, total: 0, pages: 0 } }; }
};


export default async function HomePage() {
  const [featured, popular, latest] = await Promise.all([
    safe({ featured: "true", limit: 8 }), safe({ sort: "popular", limit: 8 }), safe({ sort: "newest", limit: 12 }),
  ]);
  const inventory = [...featured.data, ...popular.data, ...latest.data];
  const heroImage = HERO_IMAGE;
  const categories = [
    ["Rent", "/rent", "Homes for every chapter", CATEGORY_IMAGES.rent],
    ["Buy", "/buy", "Make a place your own", CATEGORY_IMAGES.buy],
    ["Short Stay", "/short-stay", "Stay for a little while", CATEGORY_IMAGES.shortStay],
    ["Land", "/land", "Room to build", CATEGORY_IMAGES.land],
    ["Commercial", "/commercial", "Spaces that work", CATEGORY_IMAGES.commercial],
  ] as const;
  const uniqueInventory = [...new Map(inventory.map((property) => [property._id, property])).values()];
  const locationCards = [...new Set(uniqueInventory.map((property) => property.location.area).filter(Boolean))].slice(0, 8).map((name, index) => { const property = uniqueInventory.find((item) => item.location.area === name)!; return { name, district: property.location.district, count: uniqueInventory.filter((item) => item.location.area === name).length, image: imageFor(property) || DEMO_IMAGES[(index + 1) % DEMO_IMAGES.length] }; });
  return <>
    <section className="home-hero container">
      <div className="hero-frame"><Image className="hero-media" src={heroImage} alt="A welcoming Homes property" fill loading="eager" unoptimized={bypassImageOptimization(heroImage)} sizes="(max-width: 1320px) 100vw, 1320px" /><div className="hero-overlay" /><div className="hero-copy"><span className="eyebrow">Property discovery in Uganda</span><h1>Find a place you can trust.</h1><p>Discover homes, apartments, land and spaces across Uganda.</p></div></div>
    </section>
    <HomeSearch />

    <section className="section home-first-section"><div className="container"><div className="section-heading"><div><h2>Find what you&apos;re looking for</h2></div></div><div className="category-grid">{categories.map(([label, href, note, image]) => <Link className="category" key={href} href={href}><Image src={image} alt="" fill unoptimized={bypassImageOptimization(image)} sizes="(max-width: 760px) 50vw, 20vw" /><span className="image-shade" /><span className="category-copy"><strong>{label}</strong><small>{note}</small></span></Link>)}</div></div></section>

    <ListingSection title="Featured homes" subtitle="Selected properties worth a closer look." properties={featured.data} href="/discover?featured=true" />
    <ListingSection title="Popular right now" subtitle="Properties people are exploring most." properties={popular.data} href="/discover?sort=popular" />

    {locationCards.length > 0 && <section className="section location-section"><div className="container"><div className="section-heading"><div><h2>Explore popular locations</h2><p className="muted">Go straight to neighbourhoods represented in current inventory.</p></div></div><div className="location-grid">{locationCards.map(({ name, district, count, image }) => <Link className="location-card" key={name} href={`/locations/uganda/${encodeURIComponent(district.toLowerCase().replaceAll(" ", "-"))}/${encodeURIComponent(name.toLowerCase().replaceAll(" ", "-"))}`}><Image src={image} alt={`Property in ${name}`} fill unoptimized={bypassImageOptimization(image)} sizes="(max-width: 760px) 70vw, 25vw" /><span className="image-shade" /><span><MapPin size={18} /><span>{name}<small>{count} {count === 1 ? "property" : "properties"}</small></span></span></Link>)}</div></div></section>}

    <ListingSection title="Fresh on Homes" subtitle="The newest properties added to the marketplace." properties={latest.data} href="/discover?sort=newest" />

    <section className="trust-section"><div className="container trust-inner"><div><span className="eyebrow">A clearer way to search</span><h2>Property search with fewer unknowns.</h2><Link className="text-link" href="/safety">Read our safety guide</Link></div><div className="trust-grid">{[
      [BadgeCheck, "Verified where confirmed", "Badges appear only after the relevant Homes checks."], [ShieldCheck, "Clear representative details", "See who is responsible for the listing before you enquire."], [CalendarCheck, "Safer viewing requests", "Requests stay pending until a representative confirms them."],
    ].map(([Icon, title, copy]) => { const TrustIcon = Icon as typeof BadgeCheck; return <div className="trust-item" key={String(title)}><TrustIcon size={24} /><h3>{String(title)}</h3><p>{String(copy)}</p></div>; })}</div></div></section>

    <section className="section"><div className="container app-banner"><div className="app-copy"><span className="eyebrow">Homes for Android</span><h2>Take your property search with you.</h2><p>Save homes, compare details and request viewings wherever you are.</p><Link className="button" href="/download">Get the Android app</Link></div><div className="app-brand-lockup" aria-label="Homes for Android"><Image src="/brand/dnb-mark-dark.svg" width={122} height={92} alt="" /><strong>Homes</strong><span>Search · Save · Compare · Request viewings</span></div></div></section>
  </>;
}
