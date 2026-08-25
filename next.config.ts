import type { NextConfig } from "next";

const NO_STORE =
  "private, no-cache, no-store, max-age=0, must-revalidate";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: NO_STORE },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Optional local Cloudflare OpenNext wiring (dev only).
if (process.env.NODE_ENV !== "production") {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare") as {
    initOpenNextCloudflareForDev: () => void;
  };
  initOpenNextCloudflareForDev();
}
