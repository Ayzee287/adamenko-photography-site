import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static-first portfolio. Image formats default to AVIF/WebP via next/image.
     No custom config needed yet; add `images.remotePatterns` only if galleries
     ever move to a CDN (see vault image-strategy). */
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
