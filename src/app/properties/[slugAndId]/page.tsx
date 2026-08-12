import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Building2, MapPin, Maximize2, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { CompareButton } from "@/components/compare-provider";
import { FavoriteButton } from "@/components/favorite-button";
import { PropertyGrid } from "@/components/property-grid";
import { ShareButton } from "@/components/share-button";
import { ViewingForm } from "@/components/viewing-form";
import { getProperties, getProperty } from "@/lib/api";
import { config } from "@/lib/config";
import { formatPrice, idFromSlugAndId, locationLabel, propertyPath, titleCase } from "@/lib/format";
import { propertyMetadata } from "@/lib/metadata";

type Params = Promise<{ slugAndId: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { try { return propertyMetadata(await getProperty(idFromSlugAndId((await params).slugAndId))); } catch { return { title: "Property unavailable", robots: { index: false } }; } }

export default async function PropertyPage({ params }: { params: Params }) {
  let property; try { property = await getProperty(idFromSlugAndId((await params).slugAndId)); } catch { notFound(); }
  const images = property.media.filter((media) => media.type === "image" && media.url).slice(0, 5);
  if (property.cover?.url && !images.some((item) => item.url === property.cover?.url)) images.unshift(property.cover);
  const gallery = images.slice(0, 5);
  const similar = await getProperties({ type: property.type, area: property.location.area || undefined, limit: 4 }).catch(() => null);
  const canonical = `${config.siteUrl}${propertyPath(property)}`;
  const facts = [
    [BedDouble, property.bedrooms !== undefined ? `${property.bedrooms} bedrooms` : undefined],
    [Bath, property.bathrooms !== undefined ? `${property.bathrooms} bathrooms` : undefined],
    [Building2, titleCase(property.type)],
    [Maximize2, property.size ? `${property.size} ${property.sizeUnit}` : undefined],
  ] as const;
  const contact = property.agent ?? property.agency;
  const listingJson = { "@context": "https://schema.org", "@type": property.type === "house" || property.type === "apartment" ? "Residence" : "RealEstateListing", name: property.title, description: property.description, url: canonical, image: gallery.map((image) => image.url), address: { "@type": "PostalAddress", streetAddress: property.location.address || undefined, addressLocality: property.location.area || undefined, addressRegion: property.location.district || property.location.region || undefined, addressCountry: property.location.country || "Uganda" }, offers: { "@type": "Offer", price: property.price.amount, priceCurrency: property.price.currency } };
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: config.siteUrl }, { "@type": "ListItem", position: 2, name: "Discover", item: `${config.siteUrl}/discover` }, { "@type": "ListItem", position: 3, name: property.title, item: canonical }] };
  return <>
    <section className="section-tight property-detail"><div className="container">
      <nav aria-label="Breadcrumb" className="detail-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/discover">Discover</Link><span>/</span><span>{property.location.area || property.title}</span></nav>
      <div className="detail-heading"><div>{property.verificationStatus === "verified" && <span className="verified-mark"><ShieldCheck size={16} /> Verified listing</span>}<h1>{property.title}</h1><p><MapPin size={16} /> {locationLabel(property) || property.location.address}</p></div><div className="detail-actions"><div className="detail-favorite"><FavoriteButton id={property._id} /></div><ShareButton url={canonical} title={property.title} /></div></div>
      <div className={`detail-gallery gallery-${gallery.length}`}>{gallery.length ? gallery.map((media, index) => <div key={media.url}><Image src={media.url} alt={media.alt || `${property.title} image ${index + 1}`} fill priority={index === 0} unoptimized={media.url.includes("images.unsplash.com")} sizes={index === 0 ? "(max-width: 760px) 100vw, 66vw" : "33vw"} /></div>) : <div className="image-placeholder">Homes property</div>}</div>
      <div className="detail-layout"><article className="detail-copy">
        <div className="detail-price-mobile">{formatPrice(property.price)}</div>
        <div className="fact-row">{facts.filter(([,value]) => value).map(([Icon, value]) => <div className="fact-box" key={String(value)}><Icon size={20} /><strong>{value}</strong></div>)}</div>
        <h2>About this property</h2><p>{property.description}</p>
        {property.amenities.length > 0 && <><h2>Amenities</h2><div className="amenities">{property.amenities.map((amenity) => <div key={amenity}><span>✓</span>{amenity}</div>)}</div></>}
        <h2>Location</h2><div className="location-summary"><MapPin size={23} /><div><strong>{property.location.address || locationLabel(property)}</strong><p>Interactive map available when a map provider is configured.</p></div></div>
        {contact && <div className="agent-panel"><span className="eyebrow">Property representative</span><h2>{contact.name}</h2>{contact.verificationStatus === "verified" && <span className="verified-mark"><ShieldCheck size={16} /> Verified representative</span>}<p className="muted">{property.agent?.agency?.name ?? property.agency?.name}</p></div>}
        <div className="safety-note"><ShieldCheck size={22} /><div><strong>Stay safe while searching</strong><p>Independently verify the property and representative before sending money.</p><Link className="text-link" href="/safety">Read property safety guidance</Link></div></div>
        <CompareButton property={property} />
      </article><aside className="booking-panel"><div className="booking-price">{formatPrice(property.price)}</div><span className="muted">{property.purpose === "sale" ? "For sale" : property.purpose === "short_stay" ? "Short stay" : "For rent"}</span><ViewingForm propertyId={property._id} propertyTitle={property.title} />{property.agent?.phone && <a className="button secondary contact-button" href={`tel:${property.agent.phone}`}>Call representative</a>}{property.agent?.whatsapp && <a className="button secondary contact-button" href={`https://wa.me/${property.agent.whatsapp.replace(/\D/g, "")}`} rel="noreferrer">WhatsApp</a>}</aside></div>
    </div></section>
    {similar && similar.data.filter((item) => item._id !== property._id).length > 0 && <section className="section"><div className="container"><div className="section-heading"><h2>Similar properties</h2></div><PropertyGrid properties={similar.data.filter((item) => item._id !== property._id).slice(0, 4)} /></div></section>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJson).replaceAll("<", "\\u003c") }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replaceAll("<", "\\u003c") }} />
  </>;
}
