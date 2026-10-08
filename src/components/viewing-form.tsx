"use client";

import { useMemo, useState } from "react";
import { BOOKINGS_KEY, type LocalBooking } from "@/lib/storage";
import type { Booking } from "@/types/property";

export function ViewingForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [state, setState] = useState<{ loading: boolean; error?: string; booking?: Booking }>({ loading: false });
  const tomorrow = useMemo(() => { const value = new Date(); value.setDate(value.getDate() + 1); return value.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" }); }, []);
  const submit = async (formData: FormData) => {
    setState({ loading: true });
    const body = Object.fromEntries(formData.entries());
    const key = crypto.randomUUID();
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify({ ...body, property: propertyId, propertyTitle }) });
      const result = await response.json() as { data?: Booking; error?: { message?: string } };
      if (!response.ok || !result.data) throw new Error(result.error?.message ?? "Unable to send request");
      const local: LocalBooking = { propertyId, propertyTitle, reference: result.data.reference, scheduledAt: result.data.scheduledAt, status: result.data.status, createdAt: result.data.createdAt ?? new Date().toISOString() };
      const current: unknown = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]");
      const records = Array.isArray(current) ? current : [];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([local, ...records].slice(0, 30)));
      setState({ loading: false, booking: result.data });
    } catch (error) { setState({ loading: false, error: error instanceof Error ? error.message : "Unable to send request" }); }
  };
  if (state.booking) return <div role="status"><span className="badge">{state.booking.status}</span><h2 style={{ fontSize: "1.4rem", marginTop: 12 }}>Viewing request received</h2><p><strong>Reference:</strong> {state.booking.reference}</p><p className="muted">Your request is {state.booking.status}. The representative still needs to confirm the viewing unless the returned status says confirmed.</p></div>;
  return <form action={submit}><div><span className="eyebrow">Contact the representative</span><h2 style={{ fontSize: "1.45rem", marginTop: 5 }}>Request a viewing</h2><p className="muted">Submitting does not guarantee availability.</p></div>{state.error && <p role="alert" style={{ color: "var(--danger)" }}>{state.error}</p>}<div className="field"><label htmlFor="view-date">Preferred date</label><input id="view-date" name="date" type="date" min={tomorrow} required /></div><div className="field"><label htmlFor="view-time">Preferred time (Uganda)</label><input id="view-time" name="time" type="time" required /></div><div className="field"><label htmlFor="view-name">Name</label><input id="view-name" name="guestName" autoComplete="name" required /></div><div className="field"><label htmlFor="view-email">Email</label><input id="view-email" name="guestEmail" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="view-phone">Phone</label><input id="view-phone" name="guestPhone" type="tel" autoComplete="tel" required /></div><div className="field"><label htmlFor="view-notes">Notes (optional)</label><textarea id="view-notes" name="notes" maxLength={1000} /></div><button className="button" disabled={state.loading}>{state.loading ? "Sending request…" : "Request a viewing"}</button></form>;
}
