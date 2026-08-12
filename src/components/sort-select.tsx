"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter(); const pathname = usePathname(); const search = useSearchParams();
  return <div className="field"><label htmlFor="sort">Sort by</label><select id="sort" value={value} onChange={(event) => { const params = new URLSearchParams(search); params.set("sort", event.target.value); params.delete("page"); router.push(`${pathname}?${params}`); }}><option value="newest">Newest</option><option value="popular">Popular</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="oldest">Oldest</option></select></div>;
}
