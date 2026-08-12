import Link from "next/link";
import { Brand } from "@/components/brand";
import { ThemeControl } from "@/components/theme-control";

const groups = [
  { title: "Find a home", links: [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] },
  { title: "Company", links: [["About", "/about"], ["List Property", "/list-property"], ["Contact", "/contact"], ["Agents", "/agents"]] },
  { title: "Support", links: [["Help centre", "/help"], ["Safety", "/safety"], ["Bookings", "/bookings"], ["Download app", "/download"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-grid"><div><Brand footer /><p>Find a place you can trust, across Uganda.</p></div>{groups.map((group) => <div key={group.title}><h3>{group.title}</h3><div className="footer-links">{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>)}</div>
    <div className="footer-bottom"><div><span>© 2026 dnb Homes. All rights reserved.</span><span>Kampala, Uganda</span></div><ThemeControl /></div>
  </div></footer>;
}
