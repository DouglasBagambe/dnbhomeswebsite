import { ContactForm } from "@/components/contact-form";
import { config } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Contact", "Contact Homes in Kampala, Uganda.", "/contact");
export default function Page() {
  const whatsapp = "https://wa.me/256747877740";
  return <section className="section"><div className="container">
    <span className="eyebrow">Contact</span><h1>Talk to Homes.</h1>
    <div className="contact-grid">
      <div>
        <p>For product help, account access, viewing coordination, suspicious listings, privacy requests or general enquiries.</p>
        <p><strong>Location</strong><br />Kampala, Uganda</p>
        <p><strong>Phone</strong><br /><a className="text-link" href="tel:+256747877740">0747 877 740</a></p>
        <p><strong>WhatsApp</strong><br /><a className="text-link" href={whatsapp} target="_blank" rel="noreferrer">Message Homes on WhatsApp</a></p>
        <p><strong>Email</strong><br /><a className="text-link" href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></p>
        <p className="muted">There is currently no public walk-in office address. Contact Homes first so the right next step can be arranged.</p>
      </div>
      <ContactForm />
    </div>
  </div></section>;
}