import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// The site is a static export served by the Worker in ../worker. During
// `next dev`, /api is proxied to `wrangler dev` so the pages have live data.
export default function config(phase: string): NextConfig {
  const base: NextConfig = {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
  };

  if (phase !== PHASE_DEVELOPMENT_SERVER) return base;

  return {
    ...base,
    skipTrailingSlashRedirect: true,
    async rewrites() {
      return [{ source: "/api/:path*", destination: "http://localhost:8787/api/:path*" }];
    },
  };
}
