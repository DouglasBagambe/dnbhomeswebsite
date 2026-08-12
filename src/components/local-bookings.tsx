"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { BOOKINGS_KEY, type LocalBooking } from "@/lib/storage";
import { CalendarDays } from "lucide-react";

export function LocalBookings() {
  const subscribe = useCallback((listener: () => void) => { window.addEventListener("storage", listener); return () => window.removeEventListener("storage", listener); }, []);
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(BOOKINGS_KEY) ?? "[]", () => "[]");
  const items = useMemo(() => { try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value as LocalBooking[] : []; } catch { return []; } }, [raw]);
  if (!items.length) return <div className="state"><div><CalendarDays size={28} /><h2>No viewing requests yet</h2><p className="muted">Your successful requests will appear in this browser.</p><Link className="button" href="/discover">Find a home</Link></div></div>;
  return <div className="booking-list">{items.map((item) => <article className="booking-request" key={item.reference}><CalendarDays size={22} /><div><span className="eyebrow">{item.reference}</span><h2>{item.propertyTitle}</h2><p className="muted">Requested for {new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.scheduledAt))}</p><p>This local record does not refresh from the server. A request is confirmed only when its status says confirmed.</p><Link className="text-link" href={`/properties/${item.propertyId}`}>View property</Link></div><span className="badge">{item.status}</span></article>)}</div>;
}
