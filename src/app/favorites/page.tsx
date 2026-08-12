import { SavedProperties } from "@/components/saved-properties"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Saved properties", "Properties saved locally in this browser.", "/favorites", true);
export default function Page() { return <section className="section"><div className="container"><span className="eyebrow">This browser</span><h1>Saved properties</h1><p className="muted">Saved properties are stored on this device and are not synced to an account.</p><SavedProperties /></div></section>; }
