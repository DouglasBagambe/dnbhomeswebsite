import Link from "next/link";
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
      <Link className="button secondary small mobile-search" href="/discover">Search</Link>
      <details className="mobile-menu">
        <summary aria-label="Open menu">☰</summary>
        <nav aria-label="Mobile navigation">
          {[...primary, ...secondary].map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/download">Download App</Link>
        </nav>
      </details>
    </div>
  </header>;
}
