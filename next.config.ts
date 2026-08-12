import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // The compiler API is more reliable than parsing spawned `tsc --showConfig`
    // output in restricted build environments.
    useTypeScriptCli: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      ...(process.env.NODE_ENV === "development"
        ? [{ protocol: "http" as const, hostname: "**" }]
        : []),
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
