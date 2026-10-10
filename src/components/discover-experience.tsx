"use client";

import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, LayoutGrid, Layers, MapPin, SlidersHorizontal, X } from "lucide-react";
import { PropertyGrid } from "./property-grid";
import { PropertyImage } from "./property-image";
import { FavoriteButton } from "./favorite-button";
import { CompareButton, OpenComparisonButton } from "./compare-provider";
import { ShareButton } from "./share-button";
import { RecentProperty } from "./recent-property";
import { ViewingForm } from "./viewing-form";
import { formatPrice, locationLabel } from "@/lib/format";
import { imageFor } from "@/lib/storage";
import type { Media, PropertyPage } from "@/types/property";

type Position = { property: number; media: Record<string, number>; feed?: PropertyPage; savedAt?: number };
export function DiscoverExperience({ result, queryKey }: { result: PropertyPage; queryKey: string }) {
  const search = useSearchParams();
  const swipe = search.get("mode") === "swipe";
  const [position, setPosition] = useState<Position>({ property: 0, media: {} });
  const [extra, setExtra] = useState<PropertyPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const stage = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const viewing = useRef<HTMLDialogElement>(null);
  const pointer = useRef<{ x: number; y: number; axis?: "x" | "y" } | null>(null);
  const wheel = useRef({ value: 0, last: 0, locked: 0 });
  const items = extra?.data ?? result.data;
  const pagination = extra?.pagination ?? result.pagination;
  const property = items[Math.min(position.property, items.length - 1)];
  const media: Media[] = property ? property.media.length ? property.media : property.cover ? [property.cover] : [] : [];
  const mediaIndex = Math.min(position.media[property?._id] ?? 0, Math.max(0, media.length - 1));
  const current = media[mediaIndex];
  const storageKey = `homes:swipe:${queryKey}`;
  const pause = useCallback(() => video.current?.pause(), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null") as Position | null;
        if (saved && Number.isInteger(saved.property) && saved.property >= 0 && saved.media && typeof saved.media === "object") {
          const safe = Object.fromEntries(Object.entries(saved.media).filter(([, i]) => Number.isInteger(i) && i >= 0 && i < 40));
          const feed = saved.feed;
          const validFeed = Boolean(feed && saved.savedAt && Date.now() - saved.savedAt < 300000 && Array.isArray(feed.data) && feed.data.length > 0 && feed.data.length <= 100 && feed.data.every(item => /^[a-fA-F0-9]{24}$/.test(item._id) && typeof item.title === "string" && Array.isArray(item.media)) && feed.pagination?.page >= result.pagination.page);
          if (validFeed) setExtra(feed!);
          setPosition({ property: Math.min(saved.property, (validFeed ? feed!.data.length : result.data.length) - 1), media: safe });
        }
      } catch { /* Optional return context; discovery still works without storage. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey, result.data.length, result.pagination.page]);

  const remember = (next: Position) => {
    setPosition(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify({...next,feed:extra ?? undefined,savedAt:Date.now()})); } catch { /* Private browsing storage can be unavailable. */ }
  };
  const propertyStep = (delta: number) => {
    pause();
    remember({ ...position, property: Math.max(0, Math.min(items.length - 1, position.property + delta)) });
  };
  const mediaStep = (delta: number) => {
    if (!property) return;
    pause();
    remember({ ...position, media: { ...position.media, [property._id]: Math.max(0, Math.min(media.length - 1, mediaIndex + delta)) } });
  };
  const changeMode = (mode: "grid" | "swipe") => {
    pause();
    const url = new URL(window.location.href);
    if (mode === "swipe") url.searchParams.set("mode", mode); else url.searchParams.delete("mode");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    if (mode === "swipe") requestAnimationFrame(() => stage.current?.focus());
  };

  useEffect(() => {
    if (!swipe) return;
    const element = stage.current;
    const player = video.current;
    const hidden = () => { if (document.hidden) video.current?.pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.current?.pause(); }, { threshold: .3 });
    if (element) observer.observe(element);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", pause);
    return () => { player?.pause(); observer.disconnect(); document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", pause); };
  }, [swipe, property?._id, current?.url, pause]);

  const suppressMediaClick = useRef(0);
  const nativeVideoControls = (target: EventTarget | null, y: number) => {
    const player = target instanceof Element ? target.closest("video") : null;
    return Boolean(player && y > player.getBoundingClientRect().bottom - 56);
  };
  const handleWheel = useEffectEvent((event: WheelEvent) => {
          if ((event.target as HTMLElement).closest(".swipe-information") || nativeVideoControls(event.target, event.clientY) || event.ctrlKey) return;
          event.preventDefault();
          const now = Date.now(); if (now < wheel.current.locked) return;
          if (now - wheel.current.last > 180) wheel.current.value = 0;
          wheel.current.last = now;
          wheel.current.value += Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
          if (Math.abs(wheel.current.value) > 65) {
            const delta = Math.sign(wheel.current.value);
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) propertyStep(delta); else mediaStep(delta);
            wheel.current.value = 0; wheel.current.locked = now + 450;
          }
  });
  useEffect(() => {
    const element = stage.current; if(!swipe || !element) return;
    const listener = (event: WheelEvent) => handleWheel(event);
    element.addEventListener("wheel",listener,{passive:false});
    const frame = requestAnimationFrame(() => {
      element.focus({preventScroll:true});
      if (window.innerWidth > 600) element.closest(".is-swipe")?.scrollIntoView({block:"start",behavior:"instant"});
    });
    return ()=>{element.removeEventListener("wheel",listener);cancelAnimationFrame(frame);};
  },[swipe]);

  async function more() {
    if (loading || pagination.page >= pagination.pages) return;
    if (items.length >= 100) { const url = new URL(window.location.href); url.searchParams.set("page", String(pagination.page + 1)); window.location.assign(url); return; }
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams(queryKey); params.set("page", String(pagination.page + 1));
      const response = await fetch(`/api/discover?${params}`, { signal: AbortSignal.timeout(15000) });
      const data = await response.json() as PropertyPage;
      if (!response.ok || !Array.isArray(data.data)) throw new Error("Unable to load more homes. Your place is kept.");

      setExtra({ data: [...items, ...data.data.filter(item => !items.some(existing => existing._id === item._id))], pagination: data.pagination });
    } catch { setError("Unable to load more homes. Your place is kept. Please retry."); }
    finally { setLoading(false); }
  }

  const preloadMore = useEffectEvent(() => { void more(); });
  useEffect(() => {
    if (swipe && !loading && !error && items.length < 100 && position.property >= items.length - 2 && pagination.page < pagination.pages) { const timer = window.setTimeout(() => preloadMore(), 0); return () => window.clearTimeout(timer); }
  }, [swipe, loading, error, items.length, position.property, pagination.page, pagination.pages]);

  if (!property) return null;
  const href = `/properties/${property.slug}-${property._id}`;
  return <div className={swipe ? "discovery-experience is-swipe" : "discovery-experience"}>
    <div className="discovery-mode" role="group" aria-label="Discovery mode">
      <button className={!swipe ? "selected" : ""} aria-pressed={!swipe} onClick={() => changeMode("grid")}><LayoutGrid size={17} />Grid</button>
      <button className={swipe ? "selected" : ""} aria-pressed={swipe} onClick={() => changeMode("swipe")}><Layers size={17} />Swipe</button>
      {swipe && <button aria-label="Refine Swipe filters" onClick={() => window.dispatchEvent(new Event("homes:open-filters"))}><SlidersHorizontal size={17} /><span className="swipe-filter-label">Filters</span></button>}
      {swipe && <span className="swipe-counter" aria-live="polite">{position.property + 1} / {pagination.total} homes</span>}
    </div>
    {!swipe ? <PropertyGrid properties={items} compact /> : <>
      <p id="swipe-instructions" className="sr-only">Swipe up or down for homes, left or right for media. Use arrow keys or the labelled navigation buttons. Escape returns to Grid.</p>
      <RecentProperty id={property._id} /><article ref={stage} className="swipe-stage" tabIndex={0} aria-label="Swipe property discovery" aria-describedby="swipe-instructions"
        onKeyDown={event => {
          if (document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) return;
          if (event.key === "Escape") { changeMode("grid"); return; }
          if ((event.target as HTMLElement).closest("input, textarea, select, video, button, a")) return;
          const actions: Record<string, () => void> = { ArrowDown: () => propertyStep(1), ArrowUp: () => propertyStep(-1), ArrowRight: () => mediaStep(1), ArrowLeft: () => mediaStep(-1) };
          if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
        }}
        onDragStart={event => { if ((event.target as HTMLElement).closest(".swipe-media")) event.preventDefault(); }}
        onPointerDown={event => {
          if (event.clientX < 24 || event.clientX > window.innerWidth - 24 || (event.target as HTMLElement).closest("button, a, input, .swipe-information") || !event.isPrimary || nativeVideoControls(event.target, event.clientY)) return;
          pointer.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={event => {
          const start = pointer.current; if (!start || start.axis) return;
          const x = Math.abs(event.clientX - start.x), y = Math.abs(event.clientY - start.y);
          if (Math.max(x, y) > 12) start.axis = x > y * 1.2 ? "x" : y > x * 1.2 ? "y" : undefined;
          if (start.axis) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); }
        }}
        onClickCapture={event => { if (Date.now() < suppressMediaClick.current && (event.target as HTMLElement).closest(".swipe-media")) { event.preventDefault(); event.stopPropagation(); } }}
        onPointerCancel={() => { pointer.current = null; }}
        onPointerUp={event => {
          const start = pointer.current; pointer.current = null; if (!start) return;
          const x = event.clientX - start.x, y = event.clientY - start.y;
          if (start.axis) { suppressMediaClick.current = Date.now() + 180; event.preventDefault(); }
          if (start.axis === "x" && Math.abs(x) > 55) mediaStep(x < 0 ? 1 : -1);
          else if (start.axis === "y" && Math.abs(y) > 65) propertyStep(y < 0 ? 1 : -1);
        }}>
        <div className="swipe-media">
          {current?.type === "video" ? <SwipeVideo key={`${property._id}:${current.url}`} media={current} poster={imageFor(property)} playerRef={video} />
            : current ? <PropertyImage key={current.url} src={current.url} alt={current.alt || property.title} fill sizes="(min-width: 1024px) 65vw, 100vw" priority />
              : <div className="swipe-placeholder" role="img" aria-label="Property media unavailable">More to discover in person</div>}
          <div className="swipe-media-heading"><span>{property.purpose === "sale" ? "For sale" : property.purpose === "short_stay" ? "Short stay" : "For rent"}</span><span aria-live="polite">{media.length ? `${mediaIndex + 1} / ${media.length}` : "No media"}</span></div>
          {media.length > 1 && <div className="swipe-media-navigation"><button aria-label="Previous media" disabled={mediaIndex === 0} onClick={() => mediaStep(-1)}><ChevronLeft /></button><button aria-label="Next media" disabled={mediaIndex === media.length - 1} onClick={() => mediaStep(1)}><ChevronRight /></button></div>}
        </div>
        <div className="swipe-information">
          <div className="swipe-copy"><span className="eyebrow">Your next place</span><p className="swipe-price">{formatPrice(property.price)}</p><h2>{property.title}</h2><p className="swipe-location"><MapPin size={16} />{locationLabel(property)}</p><p className="swipe-facts">{[property.bedrooms ? `${property.bedrooms} beds` : "", property.bathrooms ? `${property.bathrooms} baths` : "", property.size ? `${property.size} ${property.sizeUnit}` : ""].filter(Boolean).join(" · ") || property.type.replaceAll("_", " ")}{property.verificationStatus === "verified" && <span> · Verified</span>}</p></div>
          <div className="swipe-actions" onClickCapture={pause}><FavoriteButton id={property._id} /><CompareButton property={property} /><ShareButton url={typeof window === "undefined" ? href : `${window.location.origin}${href}`} title={property.title} /></div>
          <div className="swipe-primary-actions" onClickCapture={pause}><OpenComparisonButton /><Link className="button secondary" href={href} onClick={pause}>View details</Link><button className="button" onClick={() => { pause(); viewing.current?.showModal(); }}>Request viewing</button></div>
          <div className="swipe-property-navigation"><button className="button secondary" aria-label="Previous property" disabled={position.property === 0} onClick={() => propertyStep(-1)}><ArrowUp size={18} />Previous</button>{position.property < items.length - 1 ? <button className="button secondary" aria-label="Next property" onClick={() => propertyStep(1)}>Next<ArrowDown size={18} /></button> : pagination.page < pagination.pages ? <button className="button secondary" onClick={more} disabled={loading}>{loading ? "Loading…" : "More homes"}</button> : <span>Last home in these results</span>}</div>
          {error && <p role="alert">{error}</p>}
        </div>
      </article>
      <dialog ref={viewing} className="swipe-viewing-dialog" onClose={() => stage.current?.focus()}><button className="header-icon" aria-label="Close viewing request" onClick={() => viewing.current?.close()}><X /></button><ViewingForm key={property._id} propertyId={property._id} propertyTitle={property.title} /></dialog>
    </>}
  </div>;
}

function SwipeVideo({ media, poster, playerRef }: { media: Media; poster?: string; playerRef: React.RefObject<HTMLVideoElement | null> }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return failed ? <div className="swipe-placeholder" role="status"><p>Video unavailable. Your home is still here.</p><button className="button secondary" onClick={() => { setFailed(false); setAttempt(attempt + 1); }}>Retry video</button></div>
    : <video key={attempt} ref={playerRef} src={media.url} poster={poster} controls playsInline preload="none" muted aria-label={media.alt || "Property video"} onError={() => setFailed(true)} />;
}
