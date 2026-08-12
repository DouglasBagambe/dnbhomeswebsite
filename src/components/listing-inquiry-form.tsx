"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api";

export function ListingInquiryForm() {
  const [status, setStatus] = useState(""); const [pending, setPending] = useState(false);
  const submit = async (data: FormData) => {
    setPending(true); setStatus("");
    try { const result = await submitInquiry("/listing-inquiries", Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value)]))); setStatus(result.message); }
    catch (error) { setStatus(error instanceof Error ? error.message : "We could not send your details. Please try again."); }
    finally { setPending(false); }
  };
  return <form className="card onboarding-form form-grid" action={submit}>
    <div className="field"><label htmlFor="lead-name">Name</label><input id="lead-name" name="name" autoComplete="name" required /></div>
    <div className="field"><label htmlFor="lead-phone">Phone</label><input id="lead-phone" name="phone" type="tel" autoComplete="tel" required /></div>
    <div className="field"><label htmlFor="lead-email">Email <span className="muted">(optional)</span></label><input id="lead-email" name="email" type="email" autoComplete="email" /></div>
    <div className="field"><label htmlFor="lead-role">I am a</label><select id="lead-role" name="role" defaultValue="owner" required><option value="owner">Property owner</option><option value="agent">Agent</option><option value="agency">Agency</option><option value="developer">Developer</option></select></div>
    <div className="field"><label htmlFor="lead-type">Property type</label><select id="lead-type" name="propertyType" defaultValue="house" required><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="short stay">Short stay</option><option value="multiple properties">Multiple properties</option></select></div>
    <div className="field"><label htmlFor="lead-location">Location</label><input id="lead-location" name="location" placeholder="Area and district" required /></div>
    <div className="field full"><label htmlFor="lead-message">Tell us about the property</label><textarea id="lead-message" name="message" required /></div>
    {status && <p className="full" role="status">{status}</p>}<button className="button full" type="submit" disabled={pending}>{pending ? "Sending…" : "Start onboarding"}</button>
  </form>;
}
