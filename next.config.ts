import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Use webpack for build (Serwist doesn't support Turbopack yet)
  turbopack: {},
  // Allow dev requests from 127.0.0.1
  allowedDevOrigins: ["http://127.0.0.1:3000"],
  serverExternalPackages: [
    "re2",
    "metascraper",
    "metascraper-description",
    "metascraper-image",
    "metascraper-title",
    "metascraper-url",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default withSerwist(nextConfig);
