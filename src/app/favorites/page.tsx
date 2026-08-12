import { SavedProperties } from "@/components/saved-properties"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Saved properties", "Properties saved locally in this browser.", "/favorites", true);
export default function Page() { return <section className="section consumer-page"><div className="container"><span className="eyebrow">Your shortlist</span><h1>Saved homes</h1><p className="muted page-intro">Saved homes stay on this device and are not synced to an account.</p><SavedProperties /></div></section>; }
