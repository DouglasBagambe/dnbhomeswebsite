import { UnavailableDirectory } from "@/components/unavailable-directory"; import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Agency profile unavailable", "Public agency profiles are not exposed yet.", "/agencies", true);
export default function Page() { return <section className="section"><div className="container"><UnavailableDirectory kind="agency" /></div></section>; }
