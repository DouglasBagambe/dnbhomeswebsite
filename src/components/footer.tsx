import Link from "next/link";
import { Brand } from "@/components/brand";
import { ThemeControl } from "@/components/theme-control";

const groups = [
  { title: "Find a Home", links: [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] },
  { title: "Homes", links: [["About", "/about"], ["Locations", "/locations/uganda"], ["Safety", "/safety"], ["Android app", "/download"]] },
  { title: "Support", links: [["Help Centre", "/help"], ["Contact", "/contact"], ["Bookings", "/bookings"]] },
] as const;

export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-grid"><div className="footer-brand-block"><Brand footer /><p>Property discovery across Uganda.</p></div>{groups.map((group) => <div key={group.title}><h3>{group.title}</h3><div className="footer-links">{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>)}</div>
    <div className="footer-bottom"><div className="footer-copyright"><span>© 2026 dnb Homes. All rights reserved.</span><span>Kampala, Uganda</span></div><nav className="footer-legal" aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav><ThemeControl /></div>
  </div></footer>;
}
