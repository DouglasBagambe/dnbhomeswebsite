"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { FAVORITES_KEY, readIds } from "@/lib/storage";
import { config } from "@/lib/config";
import type { Property } from "@/types/property";

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
  if (state.failed) return <div className="card state error"><div><h2>Saved properties are unavailable</h2><p>Check your connection and try again.</p></div></div>;
  if (!state.properties.length) return <div className="card state"><div><h2>No saved properties</h2><p className="muted">Use the heart on a property to save it in this browser.</p><Link className="button" href="/discover">Discover properties</Link></div></div>;
  return <div className="property-grid">{state.properties.map((property) => <PropertyCard key={property._id} property={property} />)}</div>;
}
