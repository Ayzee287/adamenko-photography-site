"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { ImageFigure } from "@/components/ui/image-figure";
import { Lightbox } from "./lightbox";
import { useLightbox } from "./use-lightbox";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import type { GalleryImage } from "@/types/gallery";

const SPEED = 0.45; // px/frame — a slow, ambient drift (~27px/s @60fps)

/**
 * The homepage reel — a living exhibition wall (D017). It auto-drifts slowly and
 * endlessly (tripled track, seamless wrap), so a visitor instantly sees there is
 * more to explore — but is always one gesture from control: it **pauses on hover,
 * focus, drag, and touch**, when off-screen, when the tab is hidden, and entirely
 * under reduced motion. Native horizontal scroll carries mobile swipe + momentum;
 * mouse-drag is added on desktop; click → the shared Lightbox. No desktop arrows.
 * One rAF, `scrollLeft` only — no layout thrash.
 */
export function HorizontalGallery({ images }: { images: GalleryImage[] }) {
  const { index, open, close, prev, next } = useLightbox(images.length);
  const reduced = usePrefersReducedMotion();

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const setWidthRef = useRef(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const dragRef = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const visibleRef = useRef(true);

  const loop = [...images, ...images, ...images];
  const len = images.length;

  // Measure one set's width and start centred on the middle set.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      setWidthRef.current = el.scrollWidth / 3;
      if (setWidthRef.current > 0 && el.scrollLeft < 1) {
        el.scrollLeft = setWidthRef.current;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Pause autoplay when the reel is off-screen.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (e) => {
        visibleRef.current = e[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One rAF: advance when allowed, and keep scrollLeft in the middle band so the
  // loop is seamless (works for autoplay AND manual scroll/drag).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = scrollerRef.current;
      const w = setWidthRef.current;
      if (el && w > 0 && visibleRef.current) {
        const auto =
          !reduced &&
          !hoverRef.current &&
          !focusRef.current &&
          !dragRef.current &&
          !document.hidden;
        if (auto) el.scrollLeft += SPEED;
        if (el.scrollLeft >= w * 1.5) el.scrollLeft -= w;
        else if (el.scrollLeft <= w * 0.5) el.scrollLeft += w;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Mouse drag (desktop). Touch/pen use native scroll + momentum.
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = { x: e.clientX, left: el.scrollLeft, moved: false };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const d = dragRef.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.left - dx;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    scrollerRef.current?.releasePointerCapture?.(e.pointerId);
    const moved = dragRef.current?.moved;
    // Keep `moved` readable through the click that follows, then clear.
    if (!moved) dragRef.current = null;
    else setTimeout(() => (dragRef.current = null), 0);
  };

  const handleClick = (realIndex: number) => {
    if (dragRef.current?.moved) return; // it was a drag, not a click
    open(realIndex);
  };

  return (
    <>
      <div
        ref={scrollerRef}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        onFocusCapture={() => (focusRef.current = true)}
        onBlurCapture={() => (focusRef.current = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Aperçu des galeries — faites défiler ou glissez pour explorer"
        className="flex cursor-grab items-stretch gap-2 overflow-x-auto overscroll-x-contain px-2 pb-2 select-none active:cursor-grabbing sm:gap-3 sm:px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((img, n) => {
          const realIndex = n % len;
          const isClone = n >= len; // first set is the canonical, focusable one
          return (
            <button
              key={n}
              type="button"
              tabIndex={isClone ? -1 : 0}
              aria-hidden={isClone || undefined}
              onClick={() => handleClick(realIndex)}
              aria-label={`Agrandir : ${img.alt}`}
              // Fixed height; width derives from each photo's natural aspect ratio
              // → an exhibition wall where portraits stay narrow and landscapes wide.
              className="group h-[54vh] shrink-0 sm:h-[66vh] lg:h-[74vh]"
            >
              <ImageFigure
                image={img}
                index={String(realIndex + 1).padStart(2, "0")}
                interactive
                className="h-full"
                sizes="(min-width:1024px) 60vw, (min-width:640px) 70vw, 85vw"
              />
            </button>
          );
        })}
      </div>

      <Lightbox
        images={images}
        index={index}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
