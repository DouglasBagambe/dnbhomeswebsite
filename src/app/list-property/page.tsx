import { BadgeCheck, Eye, Handshake, UserCheck } from "lucide-react";
import { ListingInquiryForm } from "@/components/listing-inquiry-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("List your property", "Start property owner, agent or agency onboarding with Homes.", "/list-property");

export default function ListPropertyPage() {
  const benefits = [[BadgeCheck, "Verified representation", "We confirm who is responsible for each property before verification."], [Eye, "Property exposure", "Reach people actively searching for homes and spaces across Uganda."], [Handshake, "Viewing leads", "Receive genuine viewing requests with clear contact details."], [UserCheck, "Professional onboarding", "Owners, agents, agencies and developers can start here."]] as const;
  return <><section className="listing-lead-hero"><div className="container listing-lead-grid"><div><span className="eyebrow">List with Homes</span><h1>Put your property in front of serious searchers.</h1><p>Tell us what you represent. The Homes team will review the details and guide you through verification and publication.</p><div className="benefit-grid">{benefits.map(([Icon, title, copy]) => <div key={title}><Icon size={21} /><strong>{title}</strong><span>{copy}</span></div>)}</div></div><ListingInquiryForm /></div></section><section className="container onboarding-note"><strong>What happens next?</strong><p>Submitting this form starts onboarding. It does not automatically publish a listing. A Homes representative will review the details before anything appears publicly.</p></section></>;
}
