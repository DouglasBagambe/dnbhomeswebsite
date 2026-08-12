"use client";

import { useState } from "react";
import type { ListingQuery } from "@/lib/query";

export function FilterPanel({ query }: { query: ListingQuery }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="button secondary mobile-filter-button" onClick={() => setOpen(!open)} aria-expanded={open}>Filters</button>
    <form className={`card filters ${open ? "open" : ""}`} action="/discover">
      <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Filters</h2>
      <div className="field"><label htmlFor="filter-q">Search</label><input id="filter-q" name="q" defaultValue={query.q} placeholder="Location or keyword" /></div>
      <div className="field"><label htmlFor="filter-purpose">Purpose</label><select id="filter-purpose" name="purpose" defaultValue={query.purpose ?? ""}><option value="">Any</option><option value="sale">Buy</option><option value="rent">Rent</option><option value="short_stay">Short Stay</option></select></div>
      <div className="field"><label htmlFor="filter-type">Type</label><select id="filter-type" name="type" defaultValue={query.type ?? ""}><option value="">Any</option><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="hotel">Hotel</option><option value="guest_house">Guest house</option><option value="serviced_apartment">Serviced apartment</option></select></div>
      <div className="field"><label htmlFor="filter-area">Area</label><input id="filter-area" name="area" defaultValue={query.area} /></div>
      <div className="field"><label htmlFor="filter-district">District</label><input id="filter-district" name="district" defaultValue={query.district} /></div>
      <div className="field"><label htmlFor="filter-min">Minimum price</label><input id="filter-min" name="minPrice" type="number" min="0" defaultValue={query.minPrice} /></div>
      <div className="field"><label htmlFor="filter-max">Maximum price</label><input id="filter-max" name="maxPrice" type="number" min="0" defaultValue={query.maxPrice} /></div>
      <div className="field"><label htmlFor="filter-beds">Bedrooms</label><select id="filter-beds" name="bedrooms" defaultValue={query.bedrooms ?? ""}><option value="">Any</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+</option>)}</select></div>
      <div className="field"><label htmlFor="filter-baths">Bathrooms</label><select id="filter-baths" name="bathrooms" defaultValue={query.bathrooms ?? ""}><option value="">Any</option>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}+</option>)}</select></div>
      <div className="field"><label htmlFor="filter-amenities">Amenities</label><input id="filter-amenities" name="amenities" defaultValue={query.amenities} placeholder="Parking, Security" /></div>
      <label style={{ display: "flex", gap: 10, alignItems: "center" }}><input name="verified" value="true" type="checkbox" defaultChecked={query.verified === "true"} /> Verified only</label>
      <input type="hidden" name="sort" value={query.sort} />
      <button className="button" type="submit">Show results</button>
      <a className="button secondary" href="/discover">Clear all</a>
    </form>
  </>;
}
