"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { BOOKINGS_KEY, type LocalBooking } from "@/lib/storage";
import type { Booking } from "@/types/property";
import { useConsumer } from "./consumer-provider";

export function ViewingForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const consumer = useConsumer();
  const idempotency = useRef<string | null>(null);
  const [state, setState] = useState<{ loading: boolean; error?: string; booking?: Booking }>({ loading: false });
  const tomorrow = useMemo(() => { const value = new Date(); value.setDate(value.getDate() + 1); return value.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" }); }, []);

  const submit = async (formData: FormData) => {
    setState({ loading: true });
    const body = Object.fromEntries(formData.entries());
    const key = idempotency.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify({ ...body, property: propertyId, propertyTitle }) });
      const result = await response.json() as { data?: Booking; error?: { message?: string } };
      if (!response.ok || !result.data) throw new Error(result.error?.message ?? "Unable to send request");
      const local: LocalBooking = { id: result.data._id, statusAccessToken: result.data.statusAccessToken, propertyId, propertyTitle, reference: result.data.reference, scheduledAt: result.data.scheduledAt, status: result.data.status, createdAt: result.data.createdAt ?? new Date().toISOString() };
      if (consumer?.user) {
        try { await consumer.refreshViewings(); } catch { /* Request succeeded; history refresh retries independently. */ }
      } else {
        try {
          const current: unknown = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]");
          const records = Array.isArray(current) ? current : [];
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify([local, ...records.filter(item => item.id !== local.id)].slice(0, 30)));
        } catch { /* Optional guest-device history cannot invalidate a successful server request. */ }
      }
      setState({ loading: false, booking: result.data });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Unable to send request" });
    }
  };

  if (state.booking) return <div role="status" className="viewing-success">
    <span className="badge">{state.booking.status}</span>
    <h2>Viewing request received</h2>
    <p><strong>Reference:</strong> {state.booking.reference}</p>
    <p className="muted">Your request is {state.booking.status}. The representative still needs to confirm the viewing unless the returned status says confirmed.</p>
    {consumer?.user && <Link className="text-link" href="/bookings">View your requests</Link>}
  </div>;

  const profile = consumer?.user;
  return <form action={submit} className="viewing-form">
    <div>
      <span className="eyebrow">Plan your visit</span>
      <h2>Request a viewing</h2>
      <p className="muted">Choose a time that works for you. We will confirm availability with the property representative.</p>
    </div>

    {state.error && <p role="alert" className="account-error">{state.error}</p>}

    {profile ? <div className="viewing-identity">
      <div className="viewing-identity-copy">
        <strong>Requesting as {profile.name.split(" ")[0]}</strong>
        <span>{profile.email}{profile.phone ? ` · ${profile.phone}` : ""}</span>
      </div>
      <Link className="text-link" href="/account">Edit contact</Link>
    </div> : <div className="viewing-guest-note">
      <strong>Contact details</strong>
      <span>We need these to coordinate this viewing and its status.</span>
    </div>}

    <div className="viewing-time-grid">
      <div className="field"><label htmlFor="view-date">Preferred date</label><input id="view-date" name="date" type="date" min={tomorrow} required /></div>
      <div className="field"><label htmlFor="view-time">Preferred time <span className="muted">(Uganda)</span></label><input id="view-time" name="time" type="time" required /></div>
    </div>

    {!profile && <>
      <div className="field"><label htmlFor="view-name">Full name</label><input id="view-name" name="guestName" autoComplete="name" minLength={2} maxLength={100} required /></div>
      <div className="field"><label htmlFor="view-email">Email</label><input id="view-email" name="guestEmail" type="email" autoComplete="email" maxLength={254} required /></div>
    </>}
    {(!profile || !profile.phone) && <div className="field">
      <label htmlFor="view-phone">{profile ? "Phone number" : "Phone"}</label>
      <input id="view-phone" name="guestPhone" type="tel" autoComplete="tel" placeholder="+256…" maxLength={30} required />
      {profile && <span className="muted">Your account does not have a phone number yet. Add one here for this request or update your profile.</span>}
    </div>}

    <div className="field"><label htmlFor="view-notes">Note <span className="muted">(optional)</span></label><textarea id="view-notes" name="notes" maxLength={1000} rows={4} placeholder="Anything the representative should know about timing or access?" /></div>

    <p className="viewing-disclaimer">Submitting sends a request, not a confirmed appointment. You will see the request as pending until the representative confirms it.</p>
    <button className="button viewing-submit" disabled={state.loading}>{state.loading ? "Sending request…" : "Request this viewing"}</button>
  </form>;
}
