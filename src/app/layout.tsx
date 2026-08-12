import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CompareProvider } from "@/components/compare-provider";
import { config } from "@/lib/config";
import "./globals.css";

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  style: "normal",
});

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: "Homes | Property discovery in Uganda", template: "%s | Homes" },
  description: "Find houses, apartments, land, commercial property and short stays across Uganda with Homes.",
  applicationName: "Homes",
  authors: [{ name: "dnb Homes", url: config.siteUrl }],
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/brand/dnb-mark-light.svg", media: "(prefers-color-scheme: light)" }, { url: "/brand/dnb-mark-dark.svg", media: "(prefers-color-scheme: dark)" }], shortcut: "/brand/dnb-mark-light.svg", apple: "/brand/dnb-mark-light.svg" },
  openGraph: { images: [{ url: "/brand/og-brand.svg", width: 1200, height: 630, alt: "Homes property discovery" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "dnb Homes", url: config.siteUrl };
  return <html lang="en" data-scroll-behavior="smooth"><body className={inter.variable}>
    <a href="#main" style={{ position: "absolute", left: "-9999px" }}>Skip to content</a>
    <CompareProvider><Header /><main id="main">{children}</main><Footer /></CompareProvider>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replaceAll("<", "\\u003c") }} />
  </body></html>;
}
