"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RECENT_SEARCHES_KEY } from "@/lib/storage";

export function HomeSearch() {
  const router = useRouter();
  const [purpose, setPurpose] = useState("rent");
  const submit = (formData: FormData) => {
    const params = new URLSearchParams();
    params.set("purpose", purpose);
    for (const key of ["q", "type", "maxPrice", "bedrooms"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    const term = String(formData.get("q") ?? "").trim();
    if (term) {
      try {
        const current: unknown = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
        const values = Array.isArray(current) ? current.filter((value): value is string => typeof value === "string") : [];
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term, ...values.filter((value) => value.toLowerCase() !== term.toLowerCase())].slice(0, 6)));
      } catch { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([term])); }
    }
    router.push(`/discover?${params}`);
  };
  return <div className="search-shell container"><div className="search-box">
    <div className="search-tabs" role="tablist" aria-label="Property purpose">{[["rent", "Rent"], ["sale", "Buy"], ["short_stay", "Short Stay"]].map(([value, label]) => <button key={value} className={`search-tab ${purpose === value ? "active" : ""}`} onClick={() => setPurpose(value)} role="tab" aria-selected={purpose === value}>{label}</button>)}</div>
    <form action={submit} className="search-grid">
      <div className="field"><label htmlFor="home-location">Location or keyword</label><input id="home-location" name="q" placeholder="Try Ntinda, Kampala or house" /></div>
      <div className="field"><label htmlFor="home-type">Property type</label><select id="home-type" name="type" defaultValue=""><option value="">Any type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="serviced_apartment">Serviced apartment</option></select></div>
      <div className="field"><label htmlFor="home-budget">Maximum budget</label><input id="home-budget" name="maxPrice" inputMode="numeric" placeholder="UGX" /></div>
      <div className="field"><label htmlFor="home-beds">Bedrooms</label><select id="home-beds" name="bedrooms" defaultValue=""><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
      <button className="button" type="submit">Search Homes</button>
    </form>
  </div></div>;
}
