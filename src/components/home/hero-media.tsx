"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { subscribeScroll } from "@/lib/scroll";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { blurFor } from "@/lib/image-blur";
import type { GalleryImage } from "@/types/gallery";

/**
 * The hero's full-bleed media with a slow "push-in" scale tied to scroll — the
 * cinematic camera move (D011). The image paints immediately at full opacity
 * (never animate the LCP); only the scale transform is scroll-driven, off the
 * shared scroll source. Scale-only (no translate) so edges never reveal; off
 * under reduced motion. Until a real hero frame exists, a warm dark panel stands
 * in (legible chrome over it, no fabricated photo).
 */
export function HeroMedia({
  image,
  hint,
}: {
  image?: GalleryImage;
  hint?: string;
}) {
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
          quality={82}
          sizes="100vw"
          placeholder={blurFor(image.src) ? "blur" : undefined}
          blurDataURL={blurFor(image.src)}
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_110%_at_75%_15%,#43392f,#15110e)]"
          />
          {/* Directed full-frame placeholder — the hero reads as a magazine cover
              waiting for its opening photograph, not an empty band (v3). */}
          {hint ? (
            <span className="pointer-events-none absolute right-5 top-24 flex max-w-[30ch] flex-col items-end gap-2 text-right sm:right-8 sm:top-28">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-paper/35">
                Image d&rsquo;ouverture · plein cadre
              </span>
              <span className="font-serif text-sm italic leading-snug text-paper/40">
                {hint}
              </span>
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
