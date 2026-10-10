import { BrandMark } from "@/components/brand";
import Link from "next/link";
import { config } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Download Homes", "Get information about the Homes mobile app.", "/download");

export default function Page() {
  return <section className="section"><div className="container app-banner download-banner"><div className="app-copy"><span className="eyebrow">Homes for mobile</span><h1>Property discovery, wherever you are.</h1><p>Search, save, compare and request property viewings from your phone.</p><div className="download-platform-status"><p><strong>Android — Available</strong></p><p><strong>iPhone — Coming soon</strong></p></div>{config.androidAppUrl ? <a className="button" href={config.androidAppUrl} rel="noreferrer">Get the Mobile app</a> : <span className="button secondary" aria-disabled="true">Android app link currently unavailable</span>}<p className="app-availability">iPhone support is in progress. The responsive website remains available on iPhone and iPad.</p><Link className="text-link app-web-link" href="/discover">Continue on the web</Link></div><div className="app-mark-panel"><BrandMark className="app-monogram" /><strong>Homes</strong><span>Property discovery across Uganda.</span></div></div></section>;
}
