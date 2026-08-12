import { LocalBookings } from "@/components/local-bookings"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Viewing requests", "Viewing requests saved locally in this browser.", "/bookings", true);
export default function Page() { return <section className="section consumer-page"><div className="container"><span className="eyebrow">Your property journey</span><h1>Viewing requests</h1><p className="muted page-intro">This browser keeps a minimal record after a successful request. It is not cross-device history.</p><LocalBookings /></div></section>; }
