"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Bath, BedDouble, ChevronLeft, ChevronRight, Clapperboard, MapPin, Share2, X } from "lucide-react";
import { Brand } from "./brand";
import { BrandLoading } from "./brand-loading";
import { FavoriteButton } from "./favorite-button";
import { PropertyImage } from "./property-image";
import { TourPlayer } from "./tour-player";
import { useToursSessions } from "./site-frame";
import { availabilityLabel } from "@/lib/availability";
import { tourCover, tourMedia, tourProperties, type TourPlace, type ToursPage } from "@/lib/tours";
import { formatPrice, locationLabel } from "@/lib/format";
import { config } from "@/lib/config";

export function ToursExperience({ initial, area, district, failed }: { initial: ToursPage; area: string; district: string; failed: boolean }) {
  const router = useRouter();
  const sessions = useToursSessions(), sessionKey = `${area}|${district}`;
  const [state, setState] = useState(() => { const saved = sessions?.get(sessionKey); return saved && Date.now() - saved.savedAt < 120000 ? saved : { ...initial, index: 0, mediaPositions: {} as Record<string, number>, muted: true, savedAt: 0 }; });
  const [busy, setBusy] = useState(false), [error, setError] = useState(failed ? "Reels couldn’t load. Check your connection and try again." : "");
  const [muted, setMuted] = useState(state.muted), [covered, setCovered] = useState(false), [notice, setNotice] = useState("");
  const stage = useRef<HTMLElement>(null), dialog = useRef<HTMLDialogElement>(null), locationButton = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null), fetching = useRef(false);
  const prefetch = useRef("");
  const pointer = useRef<{ x: number; y: number; axis?: "x" | "y" } | null>(null), suppressClick = useRef(0), wheelLock = useRef(0), wheelDistance = useRef(0);
  const property = state.data[state.index], media = property ? tourMedia(property) : [], mediaIndex = property ? Math.min(state.mediaPositions[property._id] ?? 0, Math.max(0, media.length - 1)) : 0;
  const current = media[mediaIndex], cover = property ? tourCover(property) : undefined;
  const href = property ? `/properties/${property.slug}-${property._id}` : "/discover";
  const place = [area, district].filter(Boolean).join(", ") || "Everywhere in Uganda";

  const more = useCallback(async () => {
    if (fetching.current || state.nextPage === null) return;
    fetching.current = true; setBusy(true); setError("");
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 38000);
    try {
      const params = new URLSearchParams({ page: String(state.nextPage), ...(area ? { area } : {}), ...(district ? { district } : {}) });
      const response = await fetch(`/api/tours?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Reels unavailable");
      const result = await response.json() as ToursPage;
      if (controller.signal.aborted) return;
      setState(previous => {
        const seen = new Set(previous.data.map(item => item._id));
        const locations = new Map(previous.locations.map(item => [`${item.area}|${item.district}`, item]));
        for (const item of result.locations) locations.set(`${item.area}|${item.district}`, item);
        return { ...previous, data: [...previous.data, ...tourProperties(result.data).filter(item => !seen.has(item._id) && Boolean(seen.add(item._id)))], nextPage: result.nextPage, locations: [...locations.values()] };
      });
    } catch { if (request.current === controller) setError("Couldn’t load more reels. Check your connection and retry."); }
    finally { clearTimeout(timeout); if (request.current === controller) { fetching.current = false; setBusy(false); } }
  }, [area, district, state.nextPage]);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  useEffect(() => { sessions?.set(sessionKey, { ...state, muted, savedAt: Date.now() }); }, [sessions, sessionKey, state, muted]);
  useEffect(() => {
    const key = `${state.index}:${state.data.length}`;
    if (!state.data.length || state.index < state.data.length - 2 || state.nextPage === null || busy || error || prefetch.current === key) return;
    const timer = window.setTimeout(() => { prefetch.current = key; void more(); }, 0);
    return () => window.clearTimeout(timer);
  }, [state.index, state.data.length, state.nextPage, busy, error, more]);
  const keyboard = useEffectEvent((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey || covered || (event.target instanceof Element && event.target.closest("input,select,textarea,[contenteditable],dialog"))) return;
    if (event.key === "Escape") { router.push("/discover"); return; }
    if (event.key.toLowerCase() === "m") { setMuted(m => !m); return; }
    if (event.code === "Space" && !(event.target instanceof Element && event.target.closest("button,a"))) { event.preventDefault(); stage.current?.querySelector<HTMLButtonElement>(".tour-tap-surface")?.click(); return; }
    const actions: Record<string, () => void> = { ArrowDown: () => propertyStep(1), ArrowUp: () => propertyStep(-1), ArrowRight: () => mediaStep(1), ArrowLeft: () => mediaStep(-1) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  });
  useEffect(() => { const handler = (event: KeyboardEvent) => keyboard(event); document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, []);
  function propertyStep(direction: number) { setNotice(""); setState(s => ({ ...s, index: Math.max(0, Math.min(s.data.length, s.index + direction)) })); }
  function mediaStep(direction: number) { if (property) setState(s => ({ ...s, mediaPositions: { ...s.mediaPositions, [property._id]: Math.max(0, Math.min(media.length - 1, mediaIndex + direction)) } })); }
  const wheelStep = useEffectEvent((event: WheelEvent) => {
    if (covered || Math.abs(event.deltaX) > Math.abs(event.deltaY) || (event.target as HTMLElement).closest("input, select, textarea")) return;
    event.preventDefault();
    if (Date.now() < wheelLock.current) return;
    wheelDistance.current += event.deltaY;
    if (Math.abs(wheelDistance.current) < 55) return;
    propertyStep(wheelDistance.current > 0 ? 1 : -1); wheelDistance.current = 0; wheelLock.current = Date.now() + 700;
  });
  useEffect(() => { const element = stage.current; if (!element) return; const handler = (event: WheelEvent) => wheelStep(event); element.addEventListener("wheel", handler, { passive: false }); return () => element.removeEventListener("wheel", handler); }, []);
  function closeLocation() { dialog.current?.close(); setCovered(false); locationButton.current?.focus(); }
  function selectLocation(selected: TourPlace) {
    sessions?.delete(`${selected.area}|${selected.district}`); closeLocation(); setCovered(true);
    const params = new URLSearchParams({ ...(selected.area ? { area: selected.area } : {}), ...(selected.district ? { district: selected.district } : {}) });
    // Selecting the current location should also resume playback, without waiting for navigation.
    if (selected.area === area && selected.district === district) { setCovered(false); return; }
    router.push(`/reels${params.size ? `?${params}` : ""}`);
  }
  async function share() {
    if (!property) return; setCovered(true); setNotice("");
    try { const url = `${config.siteUrl}${href}`; if (navigator.share) await navigator.share({ title: property.title, url }); else { await navigator.clipboard.writeText(url); setNotice("Property link copied"); } }
    catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setNotice("Sharing unavailable. Open the property to copy its address."); }
    finally { setCovered(false); }
  }
  const label = property ? availabilityLabel(property) : undefined;
  return <section className="tours-shell" aria-label="Property Reels">
    <header className="tours-topbar"><div className="tours-identity"><Brand /><span className="tours-divider" /><h1>Reels</h1></div>
      <button ref={locationButton} className="tours-location" onClick={() => { setCovered(true); dialog.current?.showModal(); }}><MapPin size={17} /><span>{place}</span><ChevronRight size={15} /></button>
      <Link className="tours-close" href="/discover" aria-label="Close Reels and discover homes" onClick={() => setCovered(true)}><X size={21} /><span>Close</span></Link>
    </header>
    <div className="tour-workspace">
      <aside className="tours-intro"><span className="eyebrow">A closer look</span><h2>Find a place.<br />Feel at home.</h2><p>Watch property videos, then explore the details that matter.</p><Link href="/discover"><ArrowLeft size={16} />Back to Discover</Link><div className="tours-key-guide"><span><kbd>↑</kbd><kbd>↓</kbd> Move between homes</span><span><kbd>←</kbd><kbd>→</kbd> Explore each home’s media</span><span>Scroll, swipe or use the arrows.</span></div></aside>
      <article ref={stage} className="tour-stage" tabIndex={0} aria-label="Reels viewer" aria-describedby="tour-instructions"
        onPointerDown={event => { if (covered || !event.isPrimary || event.clientX < 20 || event.clientX > innerWidth - 20 || (event.target as HTMLElement).closest("button:not(.tour-tap-surface),a,input,select")) return; pointer.current = { x: event.clientX, y: event.clientY }; }}
        onPointerMove={event => { const start = pointer.current; if (!start) return; const x = Math.abs(event.clientX - start.x), y = Math.abs(event.clientY - start.y); if (!start.axis && Math.max(x, y) > 12) start.axis = x > y * 1.2 ? "x" : y > x * 1.2 ? "y" : undefined; if (start.axis) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); } }}
        onPointerCancel={() => { pointer.current = null; }}
        onPointerUp={event => { const start = pointer.current; pointer.current = null; if (!start?.axis) return; suppressClick.current = Date.now() + 250; const x = event.clientX - start.x, y = event.clientY - start.y; if (start.axis === "x" && Math.abs(x) > 55) mediaStep(x < 0 ? 1 : -1); if (start.axis === "y" && Math.abs(y) > 65) propertyStep(y < 0 ? 1 : -1); }}
        onClickCapture={event => { if (Date.now() < suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }} onDragStart={event => event.preventDefault()}>
        <p id="tour-instructions" className="sr-only">Swipe or use up and down arrows for properties. Left and right arrows explore videos and photos within one property. Only the current video plays. Videos start muted.</p>
        {property && current ? <>
          {cover && <div className="tour-backdrop" aria-hidden="true"><PropertyImage src={cover} alt="" fill sizes="160px" /></div>}
          <div className="tour-shade" />
          {current.type === "video" ? <TourPlayer key={`${property._id}:${current.url}`} media={current} poster={cover} active={!covered} muted={muted} onMute={() => setMuted(m => !m)} /> : <TourPhoto key={current.url} url={current.url} alt={current.alt || property.title} />}
          <div className="tour-media-count"><Clapperboard size={14} /><span>{current.type === "video" ? "Video" : "Photo"} {mediaIndex + 1} / {media.length}</span></div>
          {media.length > 1 && <div className="tour-media-arrows"><button aria-label="Previous property media" disabled={mediaIndex === 0} onClick={() => mediaStep(-1)}><ChevronLeft /></button><button aria-label="Next property media" disabled={mediaIndex === media.length - 1} onClick={() => mediaStep(1)}><ChevronRight /></button></div>}
          <div className="tour-caption"><div className="tour-labels"><span>{property.purpose === "sale" ? "For sale" : property.purpose === "short_stay" ? "Short stay" : "For rent"}</span>{label && <span className="tour-availability">{label}</span>}{property.verificationStatus === "verified" && <span>Verified</span>}</div><p className="tour-price">{formatPrice(property.price)}</p><h2>{property.title}</h2><p className="tour-place"><MapPin size={14} />{locationLabel(property)}</p><div className="tour-facts">{property.bedrooms ? <span><BedDouble size={15} />{property.bedrooms} beds</span> : null}{property.bathrooms ? <span><Bath size={15} />{property.bathrooms} baths</span> : null}</div><Link className="tour-details" href={href} onClick={() => setCovered(true)}>Explore this home<ChevronRight size={17} /></Link></div>
          <div className="tour-action-rail"><div><FavoriteButton id={property._id} /><span>Save</span></div><div><button onClick={() => void share()} aria-label="Share property"><Share2 size={20} /></button><span>Share</span></div></div>
        </> : <div className="tour-empty"><Clapperboard size={32} /><h2>{busy ? "" : error ? "Let’s try that again." : state.data.length ? "You’re all caught up." : "A closer look is coming."}</h2>{busy ? <BrandLoading label="Finding property videos" /> : <><p>{error || (state.nextPage !== null ? "There may be more videos further in the collection." : state.data.length ? "Try another location, or return to a home you liked." : "No property videos here just yet. You can still explore homes in Discover.")}</p>{state.nextPage !== null && <button onClick={() => void more()}>{error ? "Try again" : "Continue exploring"}</button>}<Link href="/discover">Explore homes<ChevronRight size={16} /></Link></>}</div>}
        <div className="tour-property-arrows"><button aria-label="Previous property reel" disabled={state.index === 0} onClick={() => propertyStep(-1)}><ArrowUp /></button><button aria-label="Next property reel" disabled={state.index >= state.data.length} onClick={() => propertyStep(1)}><ArrowDown /></button></div>
        {property && error && <div className="tour-feed-error" role="status">{error}<button onClick={() => void more()}>Retry</button></div>}
        {notice && <p className="tour-notice" role="status">{notice}</p>}
      </article>
      <aside className="tours-side-note"><Clapperboard size={23} /><p>A home has<br />more to show.</p><span>Videos first.<br />Photos a swipe away.</span><span className="tours-position" aria-live="polite">{property ? `Home ${state.index + 1}` : "Reels"}</span></aside>
    </div>
    <dialog ref={dialog} className="tour-location-dialog" onCancel={event => { event.preventDefault(); closeLocation(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeLocation(); } }} aria-labelledby="tour-location-title">
      <div className="tour-location-heading"><h2 id="tour-location-title">Where shall we explore?</h2><button aria-label="Close location selector" onClick={closeLocation}><X size={21} /></button></div>
      <p>Choose a district, then narrow it to an area if you like.</p>
      <form onSubmit={event => { event.preventDefault(); const values = new FormData(event.currentTarget); selectLocation({ area: String(values.get("area") ?? "").trim(), district: String(values.get("district") ?? "").trim() }); }}>
        <label>District<input name="district" defaultValue={district} maxLength={80} list="tour-districts" placeholder="e.g. Kampala" /></label><datalist id="tour-districts">{[...new Set(state.locations.map(p => p.district))].filter(Boolean).map(d => <option key={d} value={d} />)}</datalist>
        <label>Area (optional)<input name="area" defaultValue={area} maxLength={80} placeholder="e.g. Ntinda" /></label><button className="button" type="submit">Explore this location</button>
      </form><button className="tour-everywhere" onClick={() => selectLocation({ area: "", district: "" })}>Everywhere in Uganda</button>
    </dialog>
  </section>;
}
function TourPhoto({ url, alt }: { url: string; alt: string }) {
  return <div className="tour-photo"><PropertyImage src={url} alt={alt} fill sizes="(max-width: 700px) 100vw, 480px" priority /></div>;
}
