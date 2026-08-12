"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";

const primary = [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] as const;
const secondary = [["Discover", "/discover"], ["Saved", "/favorites"], ["Bookings", "/bookings"], ["Help", "/help"]] as const;

export function Header() {
  const pathname = usePathname();
  const item = ([label, href]: readonly [string, string]) => <Link className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""} key={href} href={href}>{label}</Link>;
  return <header className="header"><div className="container header-inner">
    <Brand />
    <nav className="nav nav-primary" aria-label="Property categories">{primary.map(item)}</nav>
    <nav className="nav nav-secondary" aria-label="Account and help">{secondary.map(item)}<Link className="button small" href="/list-property">List Property</Link></nav>
    <Link className="mobile-search" href="/discover" aria-label="Search properties"><Search size={20} /></Link>
    <details className="mobile-menu"><summary aria-label="Open menu"><Menu size={22} /></summary><nav aria-label="Mobile navigation">{[...primary, ...secondary].map(item)}<Link href="/list-property">List Property</Link><Link href="/download">Download App</Link></nav></details>
  </div></header>;
}
