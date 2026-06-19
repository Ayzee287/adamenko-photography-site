"use client";

import { useCallback, useState } from "react";

/**
 * Open-state + wrap-around navigation for the shared Lightbox. One source of
 * truth reused by the genre grid (GalleryView) and the homepage reel
 * (HorizontalGallery), so the immersive viewer behaves identically everywhere.
 */
export function useLightbox(count: number) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((n) => (n === null ? n : (n - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setIndex((n) => (n === null ? n : (n + 1) % count)),
    [count],
  );

  return { index, open, close, prev, next };
}
