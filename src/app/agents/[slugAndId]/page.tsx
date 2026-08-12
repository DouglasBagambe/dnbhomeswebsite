import { UnavailableDirectory } from "@/components/unavailable-directory"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Agent profile unavailable", "Public agent profiles are not exposed yet.", "/agents", true);
export default function Page() { return <section className="section"><div className="container"><UnavailableDirectory kind="agents" /></div></section>; }
