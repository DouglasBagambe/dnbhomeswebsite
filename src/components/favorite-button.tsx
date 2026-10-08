"use client";

import { Heart } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import { FAVORITES_KEY, readIds, toggleId } from "@/lib/storage";

export function FavoriteButton({ id }: { id: string }) {
  const subscribe = useCallback((listener: () => void) => { window.addEventListener("homes:favorites", listener); window.addEventListener("storage", listener); return () => { window.removeEventListener("homes:favorites", listener); window.removeEventListener("storage", listener); }; }, []);
  const active = useSyncExternalStore(subscribe, () => readIds(localStorage, FAVORITES_KEY).includes(id), () => false);
  const toggle = () => {
    const ids = toggleId(readIds(localStorage, FAVORITES_KEY), id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("homes:favorites"));
  };
  return <button className={`favorite ${active ? "active" : ""}`} onClick={toggle} aria-label={active ? "Remove from saved properties" : "Save property"} aria-pressed={active}><Heart size={18} aria-hidden="true" fill={active ? "currentColor" : "none"} /></button>;
}
