"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { BrandLoading } from "./brand-loading";
import type { Media } from "@/types/property";
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function TourPlayer({ media, poster, active, muted, onMute }: { media: Media; poster?: string; active: boolean; muted: boolean; onMute: () => void }) {
  const player = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const video = player.current;
    if (video && !video.getAttribute("src")) video.src = media.url;
    return () => { if (video) { video.pause(); video.removeAttribute("src"); video.load(); } };
  }, [attempt, failed, media.url]);
  useEffect(() => {
    const video = player.current;
    if (!video || failed) return;
    if (!active) { video.pause(); return; }
    if (!userPaused.current && !document.hidden && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void video.play().catch(() => { setBusy(false); setPaused(true); });
    }
    const hide = () => { if (document.hidden) { userPaused.current = true; video.pause(); } };
    const leave = () => { userPaused.current = true; video.pause(); };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", leave);
    return () => { video.pause(); document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", leave); };
  }, [active, attempt, failed]);
  useEffect(() => {
    if (!busy || !active) return;
    const timeout = window.setTimeout(() => { player.current?.pause(); setFailed(true); setBusy(false); }, 20000);
    return () => window.clearTimeout(timeout);
  }, [busy, active, attempt]);
  function toggle() {
    const video = player.current; if (!video || !active) return;
    if (video.paused) { userPaused.current = false; void video.play().catch(() => { setFailed(true); setBusy(false); }); } else { userPaused.current = true; video.pause(); }
  }
  return <div className="tour-video">
    {failed ? <div className="tour-media-state" role="status"><p>This video couldn’t load.</p><button onClick={() => { setFailed(false); setBusy(true); setAttempt(n => n + 1); }}>Retry video</button></div> : <>
      <video key={attempt} ref={player} src={media.url} poster={poster} muted={muted} playsInline loop preload="metadata" aria-label={media.alt || "Property video"}
        onLoadedMetadata={event => { setBusy(false); setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); }}
        onTimeUpdate={event => setPosition(event.currentTarget.currentTime)} onPlaying={() => { setBusy(false); setPaused(false); }} onPause={() => setPaused(true)} onWaiting={() => setBusy(true)} onCanPlay={() => setBusy(false)} onError={() => { setFailed(true); setBusy(false); }} />
      <button className="tour-tap-surface" aria-label={paused ? "Play property video" : "Pause property video"} onClick={toggle}>{paused && !busy && <span><Play fill="currentColor" size={30} /></span>}</button>
      {busy && <div className="tour-buffering"><BrandLoading label="Loading property video" /></div>}
      <div className="tour-playback">
        <button onClick={toggle} aria-label={paused ? "Play video" : "Pause video"}>{paused ? <Play size={19} /> : <Pause size={19} />}</button>
        <input aria-label="Video position" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(position, duration || 0)} disabled={!duration} onChange={event => { if (player.current) { const value = Number(event.target.value); player.current.currentTime = value; setPosition(value); } }} />
        <span>{clock(position)} / {clock(duration)}</span>
        <button onClick={onMute} aria-label={muted ? "Unmute video" : "Mute video"} aria-pressed={!muted}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
      </div>
    </>}
  </div>;
}
