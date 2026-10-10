"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BOOKINGS_KEY, COMPARE_KEY, FAVORITES_KEY, readIds, type LocalBooking } from "@/lib/storage";
import { config } from "@/lib/config";
import type { Property } from "@/types/property";

export interface Consumer { id: string; name: string; email: string; phone: string; emailVerified: boolean; }
interface SyncedState { saved: string[]; compare: string[]; recent: string[]; notifications: { viewingUpdates: boolean; searchAlerts: boolean }; }
interface ConsumerContextValue { user: Consumer | null; loading: boolean; feedback: string; refresh: (force?: boolean) => Promise<void>; recordRecent: (id: string) => void; notifications: SyncedState["notifications"]; recent: string[]; signOut: (all?: boolean) => Promise<void>; viewings: LocalBooking[]; hasMoreViewings: boolean; refreshViewings: (append?: boolean) => Promise<void>; }
const ConsumerContext = createContext<ConsumerContextValue | null>(null);
export const useConsumer = () => useContext(ConsumerContext);

export async function accountAction(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`/api/account/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "Unable to complete your request. Please retry.");
  return result;
}
function readCompareIds(): string[] {
  try { return (JSON.parse(localStorage.getItem(COMPARE_KEY) ?? "[]") as Property[]).map(p => p._id).slice(0, 2); } catch { return []; }
}
export function ConsumerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Consumer | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [viewings, setViewings] = useState<LocalBooking[]>([]);
  const viewingPage = useRef(0);
  const [hasMoreViewings, setHasMoreViewings] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({viewingUpdates:true,searchAlerts:false});
  const current = useRef<Consumer | null>(null);
  const refreshing = useRef<Promise<void> | null>(null);
  const revision = useRef(0);
  const remote = useRef<SyncedState | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const epoch = useRef(0);
  const applying = useRef(false);
  const flush = useCallback(async () => {
    const owner = current.current?.id;
    if (!owner) return;
    const key = `homes:sync-outbox:${owner}`;
    let pending: { id: string; collection: string; propertyId: string; action: string }[] = [];
    try { pending = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return; }
    for (const op of pending) {
      if (current.current?.id !== owner) return;
      await accountAction("state", op);
      // Re-read so mutations queued while this request was in flight are preserved.
      const latest = JSON.parse(localStorage.getItem(key) ?? "[]") as typeof pending;
      localStorage.setItem(key, JSON.stringify(latest.filter(item => item.id !== op.id)));
    }
  }, []);
  const restoreGuest = useCallback(() => {
    applying.current = true;
    for (const key of [FAVORITES_KEY, COMPARE_KEY]) {
      const guest = localStorage.getItem(`${key}:guest`);
      if (guest !== null) localStorage.setItem(key, guest);
    }
    window.dispatchEvent(new Event("homes:favorites")); window.dispatchEvent(new Event("homes:compare"));
    applying.current = false;
  }, []);
  const refreshViewings = useCallback(async (append = false) => {
    if (!current.current) return;
    const generation = epoch.current;
    const page = append ? viewingPage.current + 1 : 1;
    const response = await fetch(`/api/account/viewings?page=${page}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Unable to refresh your viewings. Please retry.");
    const result = await response.json();
    if (generation !== epoch.current) return;
    const incoming: LocalBooking[] = result.data.map((item: { _id: string; reference: string; property: Property | null; scheduledAt: string; status: string; createdAt: string }) => ({ id: item._id, reference: item.reference, propertyId: item.property?._id ?? "", propertyTitle: item.property?.title ?? "Property no longer available", scheduledAt: item.scheduledAt, status: item.status, createdAt: item.createdAt }));
    viewingPage.current = page;
    setHasMoreViewings(page < result.pagination.pages);
    setViewings(previous => append ? [...previous, ...incoming.filter(item => !previous.some(existing => existing.id === item.id))] : incoming);
  }, []);
  const apply = useCallback(async (state: SyncedState, generation: number, expectedRevision: number) => {
    const properties = await Promise.all(state.compare.map(async id => {
      try { const response = await fetch(`${config.apiBaseUrl}/properties/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(8000) }); return response.ok ? (await response.json()).data as Property : null; } catch { return null; }
    }));
    if (generation !== epoch.current || revision.current !== expectedRevision) return;
    applying.current = true;
    remote.current = state;
    setNotifications(state.notifications);
    setRecent(state.recent);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.saved));
    localStorage.setItem(COMPARE_KEY, JSON.stringify(properties.filter(Boolean)));
    window.dispatchEvent(new Event("homes:favorites")); window.dispatchEvent(new Event("homes:compare"));
    applying.current = false;
  }, []);
  const runRefresh = useCallback(async () => {
    const generation = epoch.current;
    try {
      const response = await fetch("/api/account/me", { cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (generation !== epoch.current) return;
      if (response.status === 401) {
        if (current.current || localStorage.getItem("homes:active-account")) restoreGuest();
        localStorage.removeItem("homes:active-account");
        current.current = null; remote.current = null; setUser(null); setViewings([]); setRecent([]); return;
      }
      if (!response.ok) throw new Error("Accounts are temporarily unavailable. You can continue as a guest.");
      const { data } = await response.json() as { data: Consumer };
      const changed = current.current?.id !== data.id;
      if (changed) {
        const previous = localStorage.getItem("homes:active-account");
        if (current.current || previous && previous !== data.id) restoreGuest();
        if (!previous || previous !== data.id) for (const key of [FAVORITES_KEY, COMPARE_KEY]) localStorage.setItem(`${key}:guest`, localStorage.getItem(key) ?? "[]");
      }
      current.current = data; setUser(data);
      if (!remote.current) remote.current = {saved:readIds(localStorage,FAVORITES_KEY),compare:readCompareIds(),recent:[],notifications:{viewingUpdates:true,searchAlerts:false}};
      localStorage.setItem("homes:active-account", data.id);
      if (changed) {
        let records: LocalBooking[] = [];
        try { records = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]"); } catch { /* corrupt optional guest history */ }
        await accountAction("merge", { saved: readIds({ getItem: () => localStorage.getItem(`${FAVORITES_KEY}:guest`) }, FAVORITES_KEY).slice(0, 200), compare: (() => { try { return (JSON.parse(localStorage.getItem(`${COMPARE_KEY}:guest`) ?? "[]") as Property[]).map(p => p._id); } catch { return []; } })(), recent: readIds(localStorage, "homes:recent-views:v1").slice(0, 30), viewings: records.filter(r => r.id && r.statusAccessToken).map(r => ({ id: r.id, token: r.statusAccessToken })).slice(0, 30) });
        await flush();
        const expectedRevision = revision.current;
        const result = await fetch("/api/account/state", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!result.ok) throw new Error("Your Saved list could not refresh. Your current selection is kept.");
        await apply((await result.json()).data, generation, expectedRevision);
      } else {
        await queue.current;
        await flush();
        const expectedRevision = revision.current;
        const result = await fetch("/api/account/state", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!result.ok) throw new Error("Your Saved list could not refresh. Your current selection is kept.");
        await apply((await result.json()).data, generation, expectedRevision);
      }
      await refreshViewings(); setFeedback("");
    } catch (error) { if (generation === epoch.current) setFeedback(error instanceof Error ? error.message : "Sync unavailable. Your selection is kept."); }
    finally { setLoading(false); }
  }, [apply, flush, refreshViewings, restoreGuest]);
  const refresh = useCallback((force = false) => {
    if (force) { epoch.current++; refreshing.current = null; }
    if (refreshing.current) return refreshing.current;
    const work = runRefresh().finally(() => { if (refreshing.current === work) refreshing.current = null; });
    refreshing.current = work; return work;
  }, [runRefresh]);
  const recordRecent = useCallback((id: string) => {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return;
    const values = readIds(localStorage,"homes:recent-views:v1");
    localStorage.setItem("homes:recent-views:v1",JSON.stringify([id,...values.filter(value=>value!==id)].slice(0,30)));
    const owner = current.current?.id; if (!owner) return;
    setRecent(previous=>[id,...previous.filter(value=>value!==id)].slice(0,30));
    const key = `homes:sync-outbox:${owner}`;
    let pending: unknown[] = []; try { pending = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { /* reset malformed optional queue */ }
    localStorage.setItem(key,JSON.stringify([...pending,{id:crypto.randomUUID(),collection:"recent",propertyId:id,action:"add"}]));
    queue.current = queue.current.then(async () => { if(current.current?.id!==owner) return; try { await flush(); } catch { setFeedback("Recent homes will sync when connected."); } });
  }, [flush]);
  const signOut = useCallback(async (all = false) => {
    await accountAction(all ? "auth/revoke-sessions" : "auth/sign-out");
    epoch.current++; current.current = null; remote.current = null;
    localStorage.removeItem("homes:active-account");
    setUser(null); setViewings([]); setRecent([]); restoreGuest(); setFeedback("");
  }, [restoreGuest]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void refresh());
    const focus = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", focus); };
  }, [refresh]);
  useEffect(() => {
    const sync = (collection: "saved" | "compare") => {
      if (applying.current || !current.current || !remote.current) return;
      const next = collection === "saved" ? readIds(localStorage, FAVORITES_KEY) : readCompareIds();
      const old = remote.current[collection];
      revision.current++;
      const operations = [...old.filter(id => !next.includes(id)).map(propertyId => ({ propertyId, action: "remove" })), ...next.filter(id => !old.includes(id)).map(propertyId => ({ propertyId, action: "add" }))];
      remote.current = { ...remote.current, [collection]: next };
      const generation = epoch.current;
      const key = `homes:sync-outbox:${current.current.id}`;
      const pending = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      localStorage.setItem(key, JSON.stringify([...pending, ...operations.map(op => ({ ...op, collection, id: crypto.randomUUID() }))]));
      queue.current = queue.current.then(async () => {
        if (generation !== epoch.current) return;
        try { await flush(); setFeedback(""); }
        catch { setFeedback("Your selection is kept on this device. Sync failed; please retry from your account."); }
      });
    };
    const saved = () => sync("saved"), compare = () => sync("compare");
    window.addEventListener("homes:favorites", saved); window.addEventListener("homes:compare", compare);
    return () => { window.removeEventListener("homes:favorites", saved); window.removeEventListener("homes:compare", compare); };
  }, [flush]);
  return <ConsumerContext.Provider value={{ user, loading, feedback, refresh, signOut, viewings, hasMoreViewings, refreshViewings, recordRecent, notifications, recent }}>{children}</ConsumerContext.Provider>;
}
