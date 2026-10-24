"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { ThemeSync } from "./theme-control";
import { Footer } from "./footer";
import type { ToursPage } from "@/lib/tours";
export interface TourSession extends ToursPage { index: number; mediaPositions: Record<string, number>; muted: boolean; savedAt: number }
const ToursSessions = createContext<Map<string, TourSession> | null>(null);
export function useToursSessions() { return useContext(ToursSessions); }
export function SiteFrame({ children }: { children: ReactNode }) {
  const tours = usePathname() === "/reels";
  const [sessions] = useState(() => new Map<string, TourSession>());
  return <ToursSessions.Provider value={sessions}><ThemeSync />{!tours && <Header />}<main id="main" className={tours ? "tours-main" : undefined}>{children}</main>{!tours && <Footer />}</ToursSessions.Provider>;
}
