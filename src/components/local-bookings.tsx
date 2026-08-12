"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { BOOKINGS_KEY, type LocalBooking } from "@/lib/storage";

export function LocalBookings() {
  const subscribe = useCallback((listener: () => void) => { window.addEventListener("storage", listener); return () => window.removeEventListener("storage", listener); }, []);
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(BOOKINGS_KEY) ?? "[]", () => "[]");
  const items = useMemo(() => { try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value as LocalBooking[] : []; } catch { return []; } }, [raw]);
  if (!items.length) return <div className="card state"><div><h2>No viewing requests on this browser</h2><p className="muted">Successful viewing requests will appear here.</p><Link className="button" href="/discover">Find a property</Link></div></div>;
  return <div style={{ display: "grid", gap: 14 }}>{items.map((item) => <article className="card prose-card" key={item.reference}><div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><div><span className="eyebrow">{item.reference}</span><h2 style={{ fontSize: "1.35rem", margin: "6px 0" }}>{item.propertyTitle}</h2><p className="muted">Requested for {new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.scheduledAt))}</p></div><span className="badge">{item.status}</span></div><p>This request is only confirmed if its status says confirmed. This local record does not refresh from the server.</p><Link className="text-link" href={`/properties/${item.propertyId}`}>View property</Link></article>)}</div>;
}
