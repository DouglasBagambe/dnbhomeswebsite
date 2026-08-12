import { UnavailableDirectory } from "@/components/unavailable-directory"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Property agents", "Public Homes agent profiles will appear when verified profile APIs are available.", "/agents", true);
export default function Page() { return <section className="section"><div className="container"><span className="eyebrow">Representatives</span><h1>Property agents</h1><UnavailableDirectory kind="agents" /></div></section>; }
