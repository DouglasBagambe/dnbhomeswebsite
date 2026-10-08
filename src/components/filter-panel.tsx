"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ListingQuery } from "@/lib/query";

export function FilterPanel({ query }: { query: ListingQuery }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  return <>
    <button ref={trigger} className="button secondary mobile-filter-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="property-filters"><SlidersHorizontal size={18} />Filters</button>
    <form onKeyDown={(event) => { if (event.key === "Escape" && open) close(); }} id="property-filters" className={`card filters ${open ? "open" : ""}`} action="/discover">
      <div className="filter-heading"><h2>Refine your search</h2><button type="button" className="header-icon filter-close" aria-label="Close filters" onClick={close}><X size={20} /></button></div>
      <div className="field"><label htmlFor="filter-q">Search</label><input id="filter-q" name="q" defaultValue={query.q} placeholder="Location or keyword" /></div>
      <fieldset className="filter-group"><legend>Property</legend><div className="field"><label htmlFor="filter-purpose">Purpose</label><select id="filter-purpose" name="purpose" defaultValue={query.purpose ?? ""}><option value="">Any</option><option value="sale">Buy</option><option value="rent">Rent</option><option value="short_stay">Short Stay</option></select></div>
      <div className="field"><label htmlFor="filter-type">Type</label><select id="filter-type" name="type" defaultValue={query.type ?? ""}><option value="">Any</option><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="hotel">Hotel</option><option value="guest_house">Guest house</option><option value="serviced_apartment">Serviced apartment</option></select></div>
      </fieldset><fieldset className="filter-group"><legend>Location</legend><div className="field"><label htmlFor="filter-area">Area</label><input id="filter-area" name="area" defaultValue={query.area} /></div>
      <div className="field"><label htmlFor="filter-district">District</label><input id="filter-district" name="district" defaultValue={query.district} /></div>
      </fieldset><fieldset className="filter-group"><legend>Price & space</legend><div className="field"><label htmlFor="filter-min">Minimum price</label><input id="filter-min" name="minPrice" type="number" min="0" defaultValue={query.minPrice} /></div>
      <div className="field"><label htmlFor="filter-max">Maximum price</label><input id="filter-max" name="maxPrice" type="number" min="0" defaultValue={query.maxPrice} /></div>
      <div className="field"><label htmlFor="filter-beds">Bedrooms</label><select id="filter-beds" name="bedrooms" defaultValue={query.bedrooms ?? ""}><option value="">Any</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+</option>)}</select></div>
      <div className="field"><label htmlFor="filter-baths">Bathrooms</label><select id="filter-baths" name="bathrooms" defaultValue={query.bathrooms ?? ""}><option value="">Any</option>{[1,2,3,4].map((value) => <option key={value} value={value}>{value}+</option>)}</select></div>
      </fieldset><fieldset className="filter-group"><legend>The details</legend><div className="field"><label htmlFor="filter-amenities">Amenities</label><input id="filter-amenities" name="amenities" defaultValue={query.amenities} placeholder="Parking, Security" /></div>
      <label className="filter-check"><input name="verified" value="true" type="checkbox" defaultChecked={query.verified === "true"} /> Verified only</label>
      </fieldset><input type="hidden" name="sort" value={query.sort} />
      <button className="button" type="submit">Show results</button>
      <a className="button secondary" href="/discover">Clear all</a>
    </form>
  </>;
}
