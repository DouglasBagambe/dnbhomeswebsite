"use client";
import { useEffect, useState } from "react";
import { useConsumer } from "./consumer-provider";
import { PropertyGrid } from "./property-grid";
import { config } from "@/lib/config";
import type { Property } from "@/types/property";
export function RecentHomes() {
 const account=useConsumer(); const key=account?.recent.slice(0,6).join(",") ?? "";
 const [homes,setHomes]=useState<Property[]>([]);
 useEffect(()=>{let active=true;const controller=new AbortController();
  Promise.all(key.split(",").filter(Boolean).map(async id=>{try{const response=await fetch(`${config.apiBaseUrl}/properties/${encodeURIComponent(id)}`,{signal:controller.signal});return response.ok?(await response.json()).data as Property:null;}catch{return null;}})).then(values=>{if(active)setHomes(values.filter((value):value is Property=>value!==null));});
  return()=>{active=false;controller.abort();};
 },[key]);
 if(!key) return null;
 return <section className="recent-homes"><h2>Recently viewed</h2>{homes.length?<PropertyGrid properties={homes} compact/>:<p className="muted">Your recent homes will appear here when available.</p>}</section>;
}
