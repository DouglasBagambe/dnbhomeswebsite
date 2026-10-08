import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { PropertyGrid } from "@/components/property-grid";
import { ApiError, getAgent } from "@/lib/api";
import { idFromSlugAndId } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

type Params = Promise<{ slugAndId: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> { const value = (await params).slugAndId; const agent = await getAgent(idFromSlugAndId(value)).catch(() => null); return agent ? pageMetadata(agent.name, `View ${agent.name}'s active property listings on Homes.`, `/agents/${value}`) : { title: "Agent unavailable", robots: { index: false } }; }
export default async function Page({ params }: { params: Params }) {
  const value = (await params).slugAndId; const agent = await getAgent(idFromSlugAndId(value)).catch((error) => { if (error instanceof ApiError && error.status === 404) return null; throw error; }); if (!agent) notFound();
  return <section className="section"><div className="container"><nav className="detail-breadcrumb"><Link href="/agents">Agents</Link><span>/</span><span>{agent.name}</span></nav><div className="profile-hero">{agent.photo ? <Image src={agent.photo} alt={agent.name} width={150} height={150} unoptimized={agent.photo.includes("images.unsplash.com")} /> : <span className="profile-placeholder large"><Building2 size={42} /></span>}<div><span className="eyebrow">Property representative</span><h1>{agent.name}</h1>{agent.verificationStatus === "verified" && <span className="verified-mark"><BadgeCheck size={17} /> Verified representative</span>}{agent.agency && <p><Link className="text-link" href={`/agencies/${agent.agency.slug}-${agent.agency._id}`}>{agent.agency.name}</Link></p>}<div className="profile-contact">{agent.phone && <a href={`tel:${agent.phone}`}><Phone size={16} />{agent.phone}</a>}{agent.email && <a href={`mailto:${agent.email}`}><Mail size={16} />{agent.email}</a>}</div></div></div><div className="section-heading profile-listings"><div><h2>Active listings</h2><p className="muted">{agent.listingCount || 0} published properties</p></div></div>{agent.listings?.length ? <PropertyGrid properties={agent.listings} /> : <p className="muted">No active listings at the moment.</p>}</div></section>;
}
