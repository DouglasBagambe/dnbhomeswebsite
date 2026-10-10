"use client";
import { useEffect, useRef, useState } from "react";
import { PropertyImage } from "./property-image";
import type { Media } from "@/types/property";

export function PropertyGallery({ media, title }: { media: Media[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const photos = media.filter(item => item.type === "image");
  const count = `${photos.length} images · ${media.length - photos.length} videos`;
  const navigate = (delta: number) => setIndex(current => current === null ? null : (current + delta + media.length) % media.length);
  const close = () => { setIndex(null); opener.current?.focus(); };
  useEffect(() => {
    if (index === null) { dialog.current?.close(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [index]);
  const open = (item: Media, button: HTMLButtonElement) => { opener.current = button; setIndex(media.indexOf(item)); };
  const visible = photos.slice(0, 5);
  const active = index === null ? null : media[index];
  return <>
    <div className={`detail-gallery gallery-${visible.length}`}>{visible.length ? visible.map((item, i) => <button type="button" key={`${item.url}-${i}`} aria-label={`Open gallery image ${i + 1}`} onClick={event => open(item, event.currentTarget)}><PropertyImage key={item.url} src={item.url} alt={item.alt || `${title} image ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? "(max-width: 760px) 100vw, 66vw" : "33vw"} /></button>) : <div className="image-placeholder">No property images</div>}</div>
    {!!media.length && <button className="button secondary gallery-open" type="button" onClick={event => open(media[0], event.currentTarget)}>View all media · {count}</button>}
    <dialog ref={dialog} className="media-dialog" aria-label={`${title} media gallery`} onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => { if (event.target instanceof HTMLVideoElement) return; if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); } if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); } }}>
      <div className="media-dialog-header"><span aria-live="polite">{index === null ? "" : `${index + 1} of ${media.length} · ${active?.type === "video" ? "Video" : "Image"}`}</span><button type="button" autoFocus aria-label="Close gallery" onClick={close}>Close ✕</button></div>
      <div className="media-stage" onTouchStart={event => { const t = event.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; }} onTouchEnd={event => { const t = event.changedTouches[0], start = touch.current; touch.current = null; if (start && Math.abs(t.clientX - start.x) > 60 && Math.abs(t.clientY - start.y) < 60 && !(event.target instanceof HTMLVideoElement)) navigate(t.clientX < start.x ? 1 : -1); }}>
        {active?.type === "image" && <PropertyImage key={`${index}-${active.url}`} src={active.url} alt={active.alt || `${title} image ${(index ?? 0) + 1}`} fill sizes="100vw" />}
        {active?.type === "video" && <GalleryVideo key={`${index}-${active.url}`} item={active} poster={photos[0]?.url} />}
      </div>
      <div className="media-dialog-controls"><button type="button" aria-label="Previous media" onClick={() => navigate(-1)}>← Previous</button><span>{count}</span><button type="button" aria-label="Next media" onClick={() => navigate(1)}>Next →</button></div>
      <div className="media-index" aria-label="Choose gallery media">{media.map((item, i) => <button key={`${item.url}-${i}`} type="button" aria-label={`${item.type === "video" ? "Play video" : "View image"} ${i + 1}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)}>{item.type === "video" ? "▶" : "▧"} {i + 1}</button>)}</div>
    </dialog>
  </>;
}
function GalleryVideo({ item, poster }: { item: Media; poster?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const player = video.current; return () => { player?.pause(); }; }, [failed]);
  if (failed) return <div className="media-fallback" role="status">Video unavailable. <button type="button" onClick={() => setFailed(false)}>Retry video</button></div>;
  return <video ref={video} controls playsInline preload="none" poster={poster} aria-label={item.alt || "Property video"} onError={() => setFailed(true)}><source src={item.url} />Your browser does not support video playback.</video>;
}
