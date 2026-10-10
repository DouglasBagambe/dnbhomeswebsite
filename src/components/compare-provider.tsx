"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Property } from "@/types/property";
import { COMPARE_KEY } from "@/lib/storage";
import { formatPrice, locationLabel } from "@/lib/format";

interface CompareValue { items: Property[]; toggle: (property: Property) => void; clear: () => void; open: () => void; }
const CompareContext = createContext<CompareValue | null>(null);

export const readCompare = (storage: Pick<Storage, "getItem">): Property[] => {
  try {
    const value: unknown = JSON.parse(storage.getItem(COMPARE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is Property => typeof item === "object" && item !== null && "_id" in item).slice(0, 2) : [];
  } catch { return []; }
};

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () => sheet.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    requestAnimationFrame(() => controls()?.[0]?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const elements = controls();
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [open]);
  const subscribe = useCallback((listener: () => void) => { window.addEventListener("homes:compare", listener); window.addEventListener("storage", listener); return () => { window.removeEventListener("homes:compare", listener); window.removeEventListener("storage", listener); }; }, []);
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(COMPARE_KEY) ?? "[]", () => "[]");
  const items = useMemo(() => readCompare({ getItem: () => raw }), [raw]);
  const save = useCallback((next: Property[]) => { localStorage.setItem(COMPARE_KEY, JSON.stringify(next)); window.dispatchEvent(new Event("homes:compare")); }, []);
  const toggle = useCallback((property: Property) => {
    if (items.some((item) => item._id === property._id)) save(items.filter((item) => item._id !== property._id));
    else if (items.length < 2) save([...items, property]);
  }, [items, save]);
  const value = useMemo(() => ({ items, toggle, clear: () => save([]), open: () => setOpen(true) }), [items, toggle, save]);
  return <CompareContext.Provider value={value}>{children}
    {items.length > 0 && <div className="compare-bar" role="status"><span><strong>{items.length}/2</strong> properties selected</span><div><button className="button secondary small" onClick={() => save([])}>Clear</button>{items.length === 2 && <button className="button small" onClick={() => setOpen(true)}>Compare</button>}</div></div>}
    {open && <div className="compare-modal" role="dialog" aria-modal="true" aria-label="Compare properties"><div ref={sheet} className="compare-sheet"><div className="section-heading"><div><span className="eyebrow">Side by side</span><h2>Compare properties</h2></div><button className="button secondary" onClick={() => setOpen(false)}>Close</button></div><table className="compare-table"><thead><tr><th>Detail</th>{items.map((item) => <th key={item._id}><Link href={`/properties/${item.slug}-${item._id}`}>{item.title}</Link></th>)}</tr></thead><tbody>{[
      ["Price", ...items.map((item) => formatPrice(item.price))], ["Location", ...items.map(locationLabel)], ["Purpose", ...items.map((item) => item.purpose)], ["Type", ...items.map((item) => item.type)], ["Bedrooms", ...items.map((item) => item.bedrooms?.toString() ?? "—")], ["Bathrooms", ...items.map((item) => item.bathrooms?.toString() ?? "—")], ["Size", ...items.map((item) => item.size ? `${item.size} ${item.sizeUnit}` : "—")], ["Amenities", ...items.map((item) => item.amenities.join(", ") || "—")], ["Verified", ...items.map((item) => item.verificationStatus === "verified" ? "Yes" : "No")], ["Representative", ...items.map((item) => item.agent?.name ?? item.agency?.name ?? "—")],
    ].map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div></div>}
  </CompareContext.Provider>;
}

export function CompareButton({ property }: { property: Property }) {
  const context = useContext(CompareContext);
  if (!context) return null;
  const active = context.items.some((item) => item._id === property._id);
  const disabled = !active && context.items.length >= 2;
  return <button className={`compare-control ${active ? "active" : ""}`} disabled={disabled} onClick={() => context.toggle(property)} aria-pressed={active}>{active ? "Remove from compare" : disabled ? "Compare limit reached" : "Add to compare"}</button>;
}

export function OpenComparisonButton() { const context = useContext(CompareContext); return <button className="button secondary" disabled={context?.items.length !== 2} onClick={() => context?.open()} aria-label="Open comparison">Compare {context?.items.length ?? 0}/2</button>; }
