import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2 } from "lucide-react";
import { ErrorState } from "@/components/states";
import { getAgents } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Property agents", "Meet active property representatives on Homes.", "/agents");
export default async function Page() {
  const result = await getAgents().catch(() => null);
  return <section className="section"><div className="container"><span className="eyebrow">Representatives</span><h1>Property agents</h1><p className="page-intro muted">Explore active representatives and the properties they currently manage.</p>{!result ? <ErrorState /> : <div className="directory-grid">{result.data.map((agent) => <Link className="directory-card" key={agent._id} href={`/agents/${agent.slug}-${agent._id}`}>{agent.photo ? <Image src={agent.photo} alt="" width={84} height={84} unoptimized={agent.photo.includes("images.unsplash.com")} /> : <span className="profile-placeholder"><Building2 size={28} /></span>}<div><h2>{agent.name}</h2>{agent.verificationStatus === "verified" && <span className="verified-mark"><BadgeCheck size={16} /> Verified</span>}<p>{agent.agency?.name || "Independent representative"}</p><strong>{agent.listingCount || 0} active {agent.listingCount === 1 ? "listing" : "listings"}</strong></div></Link>)}</div>}</div></section>;
}
