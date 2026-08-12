import Link from "next/link";
import { Brand } from "@/components/brand";

const groups = [
  { title: "Find a home", links: [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] },
  { title: "Homes", links: [["Discover", "/discover"], ["About", "/about"], ["Safety", "/safety"], ["Download", "/download"]] },
  { title: "Support", links: [["Help", "/help"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function Footer() {
  return <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div><Brand /><p className="muted">Uganda-first property discovery built around trust and transparency.</p></div>
        {groups.map((group) => <div key={group.title}><h3>{group.title}</h3><div className="footer-links">{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></div>)}
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} dnb Homes</span><span>Kampala, Uganda</span></div>
    </div>
  </footer>;
}
