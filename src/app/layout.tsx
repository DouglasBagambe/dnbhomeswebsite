import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CompareProvider } from "@/components/compare-provider";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: "Homes | Property discovery in Uganda", template: "%s | Homes" },
  description: "Find houses, apartments, land, commercial property and short stays across Uganda with Homes.",
  applicationName: "Homes",
  authors: [{ name: "dnb Homes", url: config.siteUrl }],
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "dnb Homes", url: config.siteUrl };
  return <html lang="en"><body>
    <a href="#main" style={{ position: "absolute", left: "-9999px" }}>Skip to content</a>
    <CompareProvider><Header /><main id="main">{children}</main><Footer /></CompareProvider>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replaceAll("<", "\\u003c") }} />
  </body></html>;
}
