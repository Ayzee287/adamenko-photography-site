"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ImageFigure } from "@/components/ui/image-figure";
import { useDragScroll } from "@/components/gallery/use-drag-scroll";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/gallery";
import type { GalleryStrings } from "./lightbox";

/**
 * The homepage reel — an **endless exhibition wall** (v4). Framed prints (directed
 * placeholders, or real exports later) hung at one shared height, widths set by each
 * frame's natural aspect ratio. It loops forever with no visible seam and carries no
 * chrome of its own — no counter, no toolbar. The only controls are two chevrons
 * overlaid on the wall's edges; quietly present at rest, they strengthen as you
 * reach for them (globals.css `.reel-arrow`).
 *
 *   - infinite loop — the list is hung three times and the scroll position is
 *     silently recentred at each copy boundary, so the wall never starts or ends;
 *   - drag / inertia / horizontal wheel — the site's one drag-to-scroll physics,
 *     shared via useDragScroll (the reviews carousel rides the same clock);
 *   - touch-swipe (native momentum) and trackpad;
 *   - keyboard (← / →) and the two overlay chevrons advance one frame;
 *   - grab / grabbing cursor.
 *
 * The visitor sets the pace; nothing moves on its own. Reduced-motion drops the
 * inertia and uses instant jumps.
 */
export function HorizontalGallery({
  images,
  t,
}: {
  images: readonly GalleryImage[];
  t: GalleryStrings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { dragHandlers, stopInertia, reduced } = useDragScroll(scrollerRef);

  // The list, hung three times, so there is always a full copy of content on either
  // side of the viewport to scroll into before we recentre.
  const loop = [...images, ...images, ...images];
  const unit = images.length;

  // Width of one copy (frame strip + the gap that precedes the next copy), measured
  // from the DOM so varied frame widths and the flex gap are accounted for exactly.
  const copyW = useRef(0);
  const measure = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const kids = el.children as HTMLCollectionOf<HTMLElement>;
    if (kids.length >= unit + 1) {
      copyW.current = kids[unit].offsetLeft - kids[0].offsetLeft;
    }
  };

  // Keep the scroll position inside the middle copy. The jump is exactly one copy
  // wide and the copies are identical, so it is invisible — the seam never shows.
  const recenter = () => {
    const el = scrollerRef.current;
    const w = copyW.current;
    if (!el || w <= 0) return;
    while (el.scrollLeft < w) el.scrollLeft += w;
    while (el.scrollLeft >= w * 2) el.scrollLeft -= w;
  };

  // Measure once mounted and start in the middle copy, then keep recentred on scroll
  // and re-measure on resize.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    el.scrollLeft = copyW.current; // open on the middle copy → room both ways
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          recenter();
        });
    };
    const onResize = () => {
      measure();
      recenter();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- arrows + keyboard: advance ~one frame -----
  const nudge = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    stopInertia();
    recenter(); // snap into the middle copy first, so the smooth move can't hit a seam
    const kids = Array.from(el.children) as HTMLElement[];
    const cur = el.scrollLeft;
    let target: number;
    if (dir > 0) {
      const next = kids.find((k) => k.offsetLeft > cur + 4);
      target = next ? next.offsetLeft : cur + el.clientWidth;
    } else {
      const prev = [...kids].reverse().find((k) => k.offsetLeft < cur - 4);
      target = prev ? prev.offsetLeft : cur - el.clientWidth;
    }
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-1);
    }
  };

  return (
    <div className="reel-wall relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label={t.reel}
        tabIndex={0}
        {...dragHandlers}
        onKeyDown={onKeyDown}
        className={cn(
          "reel-region flex h-[280px] cursor-grab items-stretch gap-4 overflow-x-auto overscroll-x-contain px-5 select-none active:cursor-grabbing sm:h-[360px] sm:px-8 lg:h-[400px]",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {loop.map((img, n) => (
          // A plate on the wall — display only (no lightbox, no zoom). The figure is
          // the flex item: one shared height, width derived from its aspect ratio.
          <ImageFigure
            key={n}
            image={img}
            className="h-full shrink-0"
            // Fixed px, not vw: each frame's rendered width is height × its own
            // aspect ratio (the strip scrolls past the viewport), not a viewport
            // fraction. A vw value under-declares for landscape frames and starves
            // next/image's srcset pick — ceilings below cover up to 16:9 at each
            // height breakpoint (280/360/400px, see the h-[…] classes above).
            sizes="(min-width:1024px) 720px, (min-width:640px) 640px, 500px"
          />
        ))}
      </div>

      {/* Overlay chevrons — edge-anchored, vertically centred, no background. Gently
          visible at rest everywhere; they strengthen when the wall is engaged. */}
      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label={t.prevImage}
        className="reel-arrow absolute left-2 top-1/2 z-10 -translate-y-1/2 text-ink sm:left-4"
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label={t.nextImage}
        className="reel-arrow absolute right-2 top-1/2 z-10 -translate-y-1/2 text-ink sm:right-4"
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}
