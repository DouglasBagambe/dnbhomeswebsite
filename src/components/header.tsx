"use client";

import Link from "next/link";
import { Heart, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";

const propertyLinks = [["Buy", "/buy"], ["Rent", "/rent"], ["Short Stay", "/short-stay"], ["Land", "/land"], ["Commercial", "/commercial"]] as const;
const utilityLinks = [["Saved", "/favorites"], ["Bookings", "/bookings"], ["Help", "/help"]] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const item = ([label, href]: readonly [string, string]) => <Link aria-current={active(href) ? "page" : undefined} className={active(href) ? "active" : undefined} key={href} href={href}>{label}</Link>;
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButton.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") return close(true);
      if (event.key !== "Tab") return;
      const focusable = menuPanel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => firstMenuLink.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <header className="header"><div className="container header-inner">
    <Brand />
    <nav className="nav nav-primary" aria-label="Find a home">{propertyLinks.map(item)}</nav>
    <nav className="nav nav-secondary" aria-label="Your Homes and support">
      <Link aria-current={active("/favorites") ? "page" : undefined} className={active("/favorites") ? "active utility-saved" : "utility-saved"} href="/favorites"><Heart size={17} aria-hidden="true" />Saved</Link>
      {utilityLinks.slice(1).map(item)}
    </nav>
    <div className="mobile-actions">
      <Link className="header-icon" href="/discover" aria-label="Search homes"><Search size={20} /></Link>
      <Link className={`header-icon mobile-saved ${active("/favorites") ? "active" : ""}`} href="/favorites" aria-label="Saved homes" aria-current={active("/favorites") ? "page" : undefined}><Heart size={20} /></Link>
      <button ref={menuButton} className="header-icon menu-trigger" type="button" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu size={22} /></button>
    </div>
  </div>{open && <div className="mobile-menu-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close(true)}>
    <div ref={menuPanel} className="mobile-menu-sheet" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="mobile-menu-heading"><span>Menu</span><button className="header-icon" type="button" aria-label="Close navigation" onClick={() => close(true)}><X size={22} /></button></div>
      <nav aria-label="Mobile navigation">
        <section><h2>Find a Home</h2><Link ref={firstMenuLink} href="/discover" onClick={() => close()}><Search size={18} />Search homes</Link>{propertyLinks.map(([label, href]) => <Link aria-current={active(href) ? "page" : undefined} className={active(href) ? "active" : undefined} key={href} href={href} onClick={() => close()}>{label}</Link>)}</section>
        <section><h2>Your Homes</h2><Link aria-current={active("/favorites") ? "page" : undefined} className={active("/favorites") ? "active" : undefined} href="/favorites" onClick={() => close()}>Saved</Link><Link aria-current={active("/bookings") ? "page" : undefined} className={active("/bookings") ? "active" : undefined} href="/bookings" onClick={() => close()}>Bookings</Link></section>
        <section><h2>Support</h2><Link href="/help" onClick={() => close()}>Help Centre</Link><Link href="/safety" onClick={() => close()}>Safety</Link><Link href="/contact" onClick={() => close()}>Contact</Link></section>
        <section><h2>Company</h2><Link href="/about" onClick={() => close()}>About</Link></section>
      </nav>
    </div>
  </div>}</header>;
}
