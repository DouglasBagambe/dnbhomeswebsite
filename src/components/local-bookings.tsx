"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BOOKINGS_KEY, type LocalBooking } from "@/lib/storage";
import { useConsumer } from "./consumer-provider";
import { CalendarDays, RefreshCw } from "lucide-react";

export function LocalBookings() {
  const consumer = useConsumer();
  const subscribe = useCallback((listener: () => void) => { window.addEventListener("storage", listener); return () => window.removeEventListener("storage", listener); }, []);
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(BOOKINGS_KEY) ?? "[]", () => "[]");
  const guestItems = useMemo(() => { try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value as LocalBooking[] : []; } catch { return []; } }, [raw]);
  const items = consumer?.user ? [...consumer.viewings, ...guestItems.filter(item => !consumer.viewings.some(record => record.reference === item.reference))] : guestItems;
  const [refreshing,setRefreshing]=useState(false);
  const [feedback,setFeedback]=useState("");
  async function refresh() {
    if(refreshing) return;
    setRefreshing(true); setFeedback("");
    if (consumer?.user) { try { await consumer.refreshViewings(); setFeedback("Your viewing statuses are up to date."); } catch { setFeedback("Refresh failed. Your previous statuses are kept."); } finally { setRefreshing(false); } return; }
    let updated=0, failed=0, legacy=0;
    const next=await Promise.all(items.map(async item=>{
      if(!item.statusAccessToken || !item.id) {legacy++;return item;}
      try {
        const response=await fetch(`/api/bookings/${encodeURIComponent(item.id)}/status`,{headers:{'X-Viewing-Token':item.statusAccessToken},cache:'no-store',signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw Error('unavailable');
        const {data}=await response.json(); updated++;
        return {...item,status:data.status,scheduledAt:data.scheduledAt};
      }catch{failed++;return item;}
    }));
    try {localStorage.setItem(BOOKINGS_KEY,JSON.stringify(next));window.dispatchEvent(new Event("storage"));}
    catch{setFeedback("Could not save refreshed statuses in this browser.");setRefreshing(false);return;}
    setFeedback([updated?`Refreshed ${updated} viewing request${updated===1?'':'s'}.`:"",failed?"Some statuses could not refresh. Saved copies are kept.":"",legacy?"Live refresh is unavailable for older requests.":""].filter(Boolean).join(' '));
    setRefreshing(false);
  }
  if (!items.length) return <div className="state"><div><CalendarDays size={28} /><h2>No viewing requests yet</h2><p className="muted">{consumer?.user ? "Your requests appear here across your devices." : "Your successful requests will appear in this browser."}</p><Link className="button" href="/discover">Find a home</Link></div></div>;
  return <><button className="button button-secondary" onClick={refresh} disabled={refreshing}><RefreshCw size={18} />{refreshing?"Refreshing…":"Refresh statuses"}</button><p role="status" className="muted">{feedback}</p><div className="booking-list" aria-busy={refreshing}>{items.map((item) => <article className="booking-request" key={item.reference}><CalendarDays size={22} /><div><span className="eyebrow">{item.reference}</span><h2>{item.propertyTitle}</h2><p className="muted">Requested for {new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kampala" }).format(new Date(item.scheduledAt))} · Uganda time</p><p>{consumer?.viewings.some(record => record.id === item.id) || item.statusAccessToken ? "Refresh to check the latest status. A request is confirmed only when its status says confirmed." : "Live refresh is unavailable for this older request. Contact Douglas to confirm."}</p><Link className="text-link" href={`/properties/${item.propertyId}`}>View property</Link></div><span className="badge">{item.status}</span></article>)}</div>{consumer?.user && consumer.hasMoreViewings && <button className="button button-secondary" disabled={refreshing} onClick={async () => { setRefreshing(true); try { await consumer.refreshViewings(true); } catch { setFeedback("Older requests could not load. Please retry."); } finally { setRefreshing(false); } }}>Load older requests</button>}</>;
}
