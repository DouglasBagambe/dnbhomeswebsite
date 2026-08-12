"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { FAVORITES_KEY, readIds } from "@/lib/storage";
import { config } from "@/lib/config";
import type { Property } from "@/types/property";
import { Heart } from "lucide-react";

export function SavedProperties() {
  const [state, setState] = useState<{ loading: boolean; properties: Property[]; failed?: boolean }>({ loading: true, properties: [] });
  useEffect(() => {
    const load = async () => {
      const ids = readIds(localStorage, FAVORITES_KEY);
      if (!ids.length) { setState({ loading: false, properties: [] }); return; }
      try {
        const values = await Promise.all(ids.map(async (id) => { const response = await fetch(`${config.apiBaseUrl}/properties/${id}`); if (!response.ok) return null; return ((await response.json()) as { data: Property }).data; }));
        setState({ loading: false, properties: values.filter((value): value is Property => value !== null) });
      } catch { setState({ loading: false, properties: [], failed: true }); }
    };
    void load();
    const listener = () => void load(); window.addEventListener("homes:favorites", listener); return () => window.removeEventListener("homes:favorites", listener);
  }, []);
  if (state.loading) return <p className="muted">Loading saved properties…</p>;
  if (state.failed) return <div className="state error"><div><h2>Saved homes are unavailable</h2><p>Check your connection and try again.</p></div></div>;
  if (!state.properties.length) return <div className="state"><div><Heart size={28} /><h2>No saved homes</h2><p className="muted">Save homes you want to come back to.</p><Link className="button" href="/discover">Browse homes</Link></div></div>;
  return <div className="property-grid">{state.properties.map((property) => <PropertyCard key={property._id} property={property} />)}</div>;
}
