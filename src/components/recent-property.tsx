"use client";
import { useEffect } from "react";
import { useConsumer } from "./consumer-provider";
export function RecentProperty({id}:{id:string}) {
 const record = useConsumer()?.recordRecent;
 useEffect(()=>{const frame=requestAnimationFrame(()=>record?.(id));return ()=>cancelAnimationFrame(frame);},[id,record]);
 return null;
}
