import type { NextConfig } from "next";

import { validateProductionConfig } from "./src/lib/config-validation";

validateProductionConfig(process.env);
const mediaOrigins = (process.env.NEXT_PUBLIC_MEDIA_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean).map((origin) => new URL(origin));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // The compiler API is more reliable than parsing spawned `tsc --showConfig`
    // output in restricted build environments.
    useTypeScriptCli: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org", port: "", pathname: "/wikipedia/commons/**", search: "" },
      { protocol: "https", hostname: "dnbhomeswebsite-psi.vercel.app", port: "", pathname: "/images/uganda/showcase/*.jpg", search: "" },
      ...mediaOrigins.map((url) => ({ protocol: "https" as const, hostname: url.hostname, port: url.port, pathname: "/**" })),
      ...(process.env.NODE_ENV === "development" || process.env.HOMES_BUILD_PROFILE === "local"
        ? [{ protocol: "http" as const, hostname: "localhost", port: "3000", pathname: "/media/**" }, { protocol: "http" as const, hostname: "127.0.0.1", port: "3000", pathname: "/media/**" }]
        : []),
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/list-property", destination: "/contact", permanent: true }];
  },
};

export default nextConfig;
