"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export function DiscoveryLink({href,children,...props}:{href:string;children:React.ReactNode;className?:string;"aria-label"?:string}) {
 const search=useSearchParams();const [path,query]=href.split("?");const params=new URLSearchParams(query);
 if(search.get("mode")==="swipe")params.set("mode","swipe");else params.delete("mode");
 return <Link href={`${path}?${params}`} {...props}>{children}</Link>;
}
