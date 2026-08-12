"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
    <form action={submit} className="search-grid">
      <div className="search-field search-location"><label htmlFor="home-location">Location</label><input id="home-location" name="q" placeholder="Area, city or property" /></div>
      <div className="search-field"><label htmlFor="home-purpose">Purpose</label><select id="home-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="rent">Rent</option><option value="sale">Buy</option><option value="short_stay">Short Stay</option></select></div>
      <div className="field"><label htmlFor="home-type">Property type</label><select id="home-type" name="type" defaultValue=""><option value="">Any type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="serviced_apartment">Serviced apartment</option></select></div>
      <div className="search-field"><label htmlFor="home-budget">Budget</label><input id="home-budget" name="maxPrice" inputMode="numeric" placeholder="Any budget" /></div>
      <button className="button search-submit" type="submit"><Search size={20} /><span>Search Homes</span></button>
    </form>
  </div></div>;
}
