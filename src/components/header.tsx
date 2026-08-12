import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Brand } from "@/components/brand";

const primary = [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] as const;
const secondary = [["Discover", "/discover"], ["Saved", "/favorites"], ["Bookings", "/bookings"], ["Help", "/help"]] as const;

export function Header() {
  return <header className="header">
    <div className="container header-inner">
      <Brand />
      <nav className="nav" aria-label="Property categories">
        {primary.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <nav className="nav nav-secondary" aria-label="Account and help">
        {secondary.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <Link className="button small" href="/download">Download App</Link>
      </nav>
      <Link className="mobile-search" href="/discover" aria-label="Search properties"><Search size={20} /></Link>
      <details className="mobile-menu">
        <summary aria-label="Open menu"><Menu size={22} /></summary>
        <nav aria-label="Mobile navigation">
          {[...primary, ...secondary].map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/download">Download App</Link>
        </nav>
      </details>
    </div>
  </header>;
}
