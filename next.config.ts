import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

// Cloudflare OpenNext local wiring — skip on Vercel builds.
if (!process.env.VERCEL) {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare") as {
    initOpenNextCloudflareForDev: () => void;
  };
  initOpenNextCloudflareForDev();
}
