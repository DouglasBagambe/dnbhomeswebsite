import { ErrorState } from "@/components/states";
import Link from "next/link";
import { BadgeCheck, Building2 } from "lucide-react";
import { getAgencies } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Property agencies", "Browse active property agencies on Homes.", "/agencies");
export default async function Page() { const result = await getAgencies().catch(() => null); return <section className="section"><div className="container"><span className="eyebrow">Companies</span><h1>Property agencies</h1><p className="page-intro muted">Active agencies with published property on Homes.</p>{!result ? <ErrorState /> : <div className="directory-grid">{result.data.map((agency) => <Link className="directory-card" href={`/agencies/${agency.slug}-${agency._id}`} key={agency._id}><span className="profile-placeholder"><Building2 size={28} /></span><div><h2>{agency.name}</h2>{agency.verificationStatus === "verified" && <span className="verified-mark"><BadgeCheck size={16} /> Verified</span>}<strong>{agency.listingCount || 0} active listings</strong></div></Link>)}</div>}</div></section>; }
