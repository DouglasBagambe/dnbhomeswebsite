import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { HomeSearch } from "@/components/home-search";
import { EmptyState, ErrorState } from "@/components/states";
import { ListingSection } from "@/components/section";
import { getProperties } from "@/lib/api";
import { bypassImageOptimization, imageFor } from "@/lib/storage";
import type { PropertyPage } from "@/types/property";

const DEMO_IMAGES = [
  "/images/1600585154340-be6161a56a0c.jpg",
  "/images/1600566753086-00f18fb6b3ea.jpg",
  "/images/1600607687939-ce8a6c25118c.jpg",
  "/images/1600047509807-ba8f99d2cdde.jpg",
  "/images/1486406146926-c627a92ad1ab.jpg",
];

const CATEGORY_IMAGES = {
  rent: "/images/1522708323590-d24dbb6b0267.jpg",
  buy: "/images/1600585154340-be6161a56a0c.jpg",
  shortStay: "/images/1600566753086-00f18fb6b3ea.jpg",
  land: "/images/1500382017468-9049fed747ef.jpg",
  commercial: "/images/1497366754035-f200968a6e72.jpg",
} as const;

const HERO_IMAGE = "/images/1600585154340-be6161a56a0c.jpg";

const safe = async (query: Parameters<typeof getProperties>[0]): Promise<PropertyPage & { unavailable?: boolean }> => {
  try { return await getProperties(query); } catch { return { unavailable: true, data: [], pagination: { page: 1, limit: 8, total: 0, pages: 0 } }; }
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
  const locationCards = [...new Set(uniqueInventory.map((property) => property.location.area).filter(Boolean))].slice(0, 8).map((name, index) => { const property = uniqueInventory.find((item) => item.location.area === name)!; return { name, district: property.location.district, illustrative: !imageFor(property), image: imageFor(property) || DEMO_IMAGES[(index + 1) % DEMO_IMAGES.length] }; });
  return <>
    <section className="home-hero container">
      <div className="hero-frame"><Image className="hero-media" src={heroImage} alt="Illustrative contemporary home with an open garden" fill loading="eager" unoptimized={bypassImageOptimization(heroImage)} sizes="(max-width: 1440px) 100vw, 1440px" /><div className="hero-overlay" /><div className="hero-copy"><span className="eyebrow">Property discovery in Uganda</span><h1>Find your place<br />in Uganda.</h1><p>Homes, apartments, land and commercial spaces.<br className="desktop-break" /> Clearer details. A considered next step.</p></div><HomeSearch /><span className="hero-image-note">Illustrative property photography</span></div>
    </section>

    <section className="section home-first-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">A place for every purpose</span><h2>What brings you here?</h2></div><p className="muted section-note">A new chapter. A short stay.<br />Or space for what comes next.</p></div><div className="category-grid">{categories.map(([label, href, note, image]) => <Link className="category" key={href} href={href}><Image src={image} alt="" fill unoptimized={bypassImageOptimization(image)} sizes="(max-width: 760px) 50vw, 20vw" /><span className="image-shade" /><span className="category-copy"><small>{note}</small><strong>{label}<span aria-hidden="true">↗</span></strong></span></Link>)}</div><p className="photography-note">Illustrative photography. Explore each category for current listings.</p></div></section>

    {featured.data.length > 0 && <ListingSection title="Featured homes" subtitle="Selected properties worth a closer look." properties={featured.data} href="/discover?featured=true" />}
    {popular.data.length > 0 && <ListingSection title="Popular right now" subtitle="Properties people are exploring most." properties={popular.data} href="/discover?sort=popular" />}
    {inventory.length === 0 && <section className="section"><div className="container"><div className="section-heading"><h2>Explore Homes</h2></div>{featured.unavailable || popular.unavailable || latest.unavailable ? <ErrorState /> : <EmptyState title="No published listings yet" message="Published properties will appear here. You can explore property types or contact Homes for help with your search." />}</div></section>}

    {locationCards.length > 0 && <section className="section location-section"><div className="container"><div className="section-heading"><div><h2>Places to put down roots</h2><p className="muted">Get to know the neighbourhoods in our latest listings.</p></div></div><div className="location-grid">{locationCards.map(({ name, district, image, illustrative }) => <Link className="location-card" key={name} href={`/locations/uganda/${encodeURIComponent(district.toLowerCase().replaceAll(" ", "-"))}/${encodeURIComponent(name.toLowerCase().replaceAll(" ", "-"))}`}><Image src={image} alt={illustrative ? `Illustrative property photography for ${name} discovery` : `Property in ${name}`} fill unoptimized={bypassImageOptimization(image)} sizes="(max-width: 760px) 70vw, 25vw" /><span className="image-shade" /><span><MapPin size={18} /><span>{name}<small>{district}</small></span></span></Link>)}</div></div></section>}

    {latest.data.length > 0 && <ListingSection title="Fresh on Homes" subtitle="The newest properties added to the marketplace." properties={latest.data} href="/discover?sort=newest" />}

    <section className="trust-section"><div className="container trust-inner"><div><span className="eyebrow">A clearer way to search</span><h2>Clarity, before commitment.</h2><Link className="text-link" href="/safety">Read our safety guide</Link></div><div className="trust-grid">{[
      [BadgeCheck, "Verified where confirmed", "Badges appear only after the relevant Homes checks."], [ShieldCheck, "Clear representative details", "See who is responsible for the listing before you enquire."], [CalendarCheck, "Safer viewing requests", "Requests stay pending until a representative confirms them."],
    ].map(([Icon, title, copy]) => { const TrustIcon = Icon as typeof BadgeCheck; return <div className="trust-item" key={String(title)}><TrustIcon size={24} /><h3>{String(title)}</h3><p>{String(copy)}</p></div>; })}</div></div></section>

    <section className="section"><div className="container app-banner"><div className="app-copy"><span className="eyebrow">Homes for Android</span><h2>Take your property search with you.</h2><p>Save homes, compare details and request viewings wherever you are.</p><Link className="button" href="/download">Get the Android app</Link></div><div className="app-brand-lockup" aria-label="Homes for Android"><span className="app-monogram" aria-hidden="true">H.</span><strong>Homes, wherever<br />you find yourself.</strong><span>Discover. Save. Request a viewing.</span></div></div></section>
  </>;
}
