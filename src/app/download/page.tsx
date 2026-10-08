import Link from "next/link";
import { config } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Download Homes", "Get information about the Homes Android app.", "/download");

export default function Page() {
  return <section className="section"><div className="container app-banner download-banner"><div className="app-copy"><span className="eyebrow">Homes for Android</span><h1>Property discovery, wherever you are.</h1><p>Search, save, compare and request property viewings from your phone.</p>{config.androidAppUrl ? <a className="button" href={config.androidAppUrl} rel="noreferrer">Get the Android app</a> : <span className="button secondary" aria-disabled="true">Android download link coming soon</span>}<p className="app-availability">Homes is not currently claiming an iOS release. The responsive website remains available on iPhone and iPad.</p><Link className="text-link app-web-link" href="/discover">Continue on the web</Link></div><div className="app-mark-panel"><span className="app-monogram" aria-hidden="true">H.</span><strong>Homes</strong><span>Property discovery across Uganda.</span></div></div></section>;
}
