"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (data: FormData) => {
    setPending(true); setStatus("");
    try {
      const result = await submitInquiry("/contact", Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value)])));
      setStatus(result.message);
    } catch (error) { setStatus(error instanceof Error ? error.message : "We could not send your message. Please try again."); }
    finally { setPending(false); }
  };
  return <form className="card prose-card form-grid" action={submit}>
    <div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" autoComplete="name" required /></div>
    <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" required /></div>
    <div className="field full"><label htmlFor="contact-phone">Phone <span className="muted">(optional)</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" /></div>
    <div className="field full"><label htmlFor="contact-subject">Subject</label><input id="contact-subject" name="subject" required /></div>
    <div className="field full"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required /></div>
    {status && <p className="full" role="status">{status}</p>}<button className="button full" type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
  </form>;
}
