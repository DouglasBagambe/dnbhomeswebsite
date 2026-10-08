import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Globe2, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { PropertyGrid } from "@/components/property-grid";
import { ApiError, getAgency } from "@/lib/api";
import { idFromSlugAndId } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

type Params = Promise<{ slugAndId: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { const value = (await params).slugAndId; const agency = await getAgency(idFromSlugAndId(value)).catch(() => null); return agency ? pageMetadata(agency.name, agency.description || `View ${agency.name}'s active listings on Homes.`, `/agencies/${value}`) : { title: "Agency unavailable", robots: { index: false } }; }
export default async function Page({ params }: { params: Params }) {
  const value = (await params).slugAndId; const agency = await getAgency(idFromSlugAndId(value)).catch((error) => { if (error instanceof ApiError && error.status === 404) return null; throw error; }); if (!agency) notFound();
  return <section className="section"><div className="container"><nav className="detail-breadcrumb"><Link href="/agencies">Agencies</Link><span>/</span><span>{agency.name}</span></nav><div className="profile-hero">{agency.logo ? <Image src={agency.logo} alt="" width={150} height={150} unoptimized={agency.logo.includes("images.unsplash.com")} /> : <span className="profile-placeholder large"><Building2 size={42} /></span>}<div><span className="eyebrow">Property agency</span><h1>{agency.name}</h1>{agency.verificationStatus === "verified" && <span className="verified-mark"><BadgeCheck size={17} /> Verified agency</span>}<p className="profile-description">{agency.description}</p><div className="profile-contact">{agency.phone && <a href={`tel:${agency.phone}`}><Phone size={16} />{agency.phone}</a>}{agency.email && <a href={`mailto:${agency.email}`}><Mail size={16} />{agency.email}</a>}{agency.website && <a href={agency.website} rel="noreferrer"><Globe2 size={16} />Website</a>}</div></div></div><div className="section-heading profile-listings"><div><h2>Active listings</h2><p className="muted">{agency.listingCount || 0} published properties</p></div></div>{agency.listings?.length ? <PropertyGrid properties={agency.listings} /> : <p className="muted">No active listings at the moment.</p>}</div></section>;
}
