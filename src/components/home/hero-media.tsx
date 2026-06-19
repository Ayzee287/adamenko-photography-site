"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { subscribeScroll } from "@/lib/scroll";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import type { GalleryImage } from "@/types/gallery";

/**
 * The hero's full-bleed media with a slow "push-in" scale tied to scroll — the
 * cinematic camera move (D011). The image paints immediately at full opacity
 * (never animate the LCP); only the scale transform is scroll-driven, off the
 * shared scroll source. Scale-only (no translate) so edges never reveal; off
 * under reduced motion. Until a real hero frame exists, a warm dark panel stands
 * in (legible chrome over it, no fabricated photo).
 */
export function HeroMedia({ image }: { image?: GalleryImage }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const update = () => {
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / vh));
      el.style.transform = `scale(${(1 + p * 0.08).toFixed(3)})`;
    };
    const unsub = subscribeScroll(update);
    return () => {
      unsub();
      el.style.transform = "";
    };
  }, [reduced]);

  return (
    <div ref={ref} className="hero-media absolute inset-0">
      {image?.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#3a312c] via-[#2a2420] to-[#191512]"
        />
      )}
    </div>
  );
}
