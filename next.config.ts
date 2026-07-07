import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static-first portfolio. Image formats default to AVIF/WebP via next/image.
     No custom config needed yet; add `images.remotePatterns` only if galleries
     ever move to a CDN (see vault image-strategy).

     `qualities` — Next 16 restricts the allowed `quality` values to this list
     (default `[75]`). A photography brand re-encoded to AVIF/WebP at 75 reads
     slightly soft on skin, hair and fabric; 82 recovers perceived sharpness at a
     small, lazy-loaded byte cost, and 85 is reserved for the on-demand lightbox
     (the dedicated "examine the photo" surface). We do NOT chase 100 — AVIF gains
     nothing visible there for a large size penalty. The masters cap at 1280px on
     the long edge, so true sharpness on full-bleed/retina surfaces is bounded by
     the source, not compression (see docs/image-quality-audit). */
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82, 85],
    /* Browser/edge TTL for optimized images (31 days). The default inherits the
       source's `max-age=0, must-revalidate` (measured on production 2026-07-07),
       so every return visit revalidated all ~40 gallery images. The photographs
       are immutable in practice — a new export gets a new `<genre>-NN.jpg` name
       (and a new blur entry), so a stale-after-swap window never arises. */
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
