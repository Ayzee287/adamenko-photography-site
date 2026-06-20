"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ImageFigure } from "@/components/ui/image-figure";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/gallery";

/**
 * The homepage reel — an **exhibition wall** (v3). Framed prints (directed
 * placeholders, or real exports later) hung at one shared height, widths set by
 * each frame's natural aspect ratio. It is **fully manual** — no autoplay, no
 * loop, no lightbox, no zoom:
 *
 *   - mouse-drag with momentum/inertia on release;
 *   - touch-swipe and trackpad scroll (native);
 *   - vertical + horizontal mouse wheel → horizontal scroll (boundary-aware);
 *   - keyboard (← / →) and minimal editorial prev/next arrows;
 *   - a quiet plate counter (01 / 10);
 *   - grab / grabbing cursor.
 *
 * The visitor sets the pace; nothing moves on its own. Reduced-motion drops the
 * inertia and uses instant arrow jumps.
 */
export function HorizontalGallery({ images }: { images: GalleryImage[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const [index, setIndex] = useState(0); // leading frame, for the counter
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Drag state (mouse) + last-sample velocity for inertia.
  const drag = useRef<
    | { x: number; left: number; moved: boolean; lastX: number; lastT: number; v: number }
    | null
  >(null);
  const inertiaRaf = useRef(0);

  const stopInertia = () => {
    if (inertiaRaf.current) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = 0;
    }
  };

  // Derive the counter + edge flags from the scroll position.
  const sync = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
    const kids = Array.from(el.children) as HTMLElement[];
    const x = el.scrollLeft + 8;
    let i = 0;
    for (let k = 0; k < kids.length; k++) {
      if (kids[k].offsetLeft + kids[k].offsetWidth > x) {
        i = k;
        break;
      }
    }
    setIndex(i);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    sync();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Wheel → horizontal. Honour horizontal intent (deltaX); for vertical wheel,
  // fall through to the page only at the ends so the reel never traps the scroll.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontal ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atEdge =
        (delta > 0 && el.scrollLeft >= max - 1) ||
        (delta < 0 && el.scrollLeft <= 0);
      if (atEdge && !horizontal) return; // let the page scroll past the ends
      e.preventDefault();
      stopInertia();
      el.scrollLeft += delta;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ----- mouse drag + inertia -----
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return; // touch/pen use native momentum scroll
    const el = scrollerRef.current;
    if (!el) return;
    stopInertia();
    drag.current = {
      x: e.clientX,
      left: el.scrollLeft,
      moved: false,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
    };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    el.scrollLeft = d.left - dx;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = (e.clientX - d.lastX) / dt; // px/ms
    d.lastX = e.clientX;
    d.lastT = now;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const d = drag.current;
    el?.releasePointerCapture?.(e.pointerId);
    drag.current = null;
    if (!el || !d || reduced) return;
    let v = d.v * 16; // px/ms → ~px/frame
    if (Math.abs(v) < 0.5) return;
    const max = () => el.scrollWidth - el.clientWidth;
    const step = () => {
      el.scrollLeft -= v;
      v *= 0.92; // decay → natural stop
      if (Math.abs(v) > 0.3 && el.scrollLeft > 0 && el.scrollLeft < max()) {
        inertiaRaf.current = requestAnimationFrame(step);
      } else {
        inertiaRaf.current = 0;
      }
    };
    inertiaRaf.current = requestAnimationFrame(step);
  };

  // ----- arrows + keyboard: move ~one frame -----
  const scrollToFrame = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    stopInertia();
    const kids = Array.from(el.children) as HTMLElement[];
    const target = kids[Math.min(kids.length - 1, Math.max(0, i))];
    if (target)
      el.scrollTo({ left: target.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  };
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToFrame(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToFrame(index - 1);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const arrow =
    "group/btn inline-flex items-center text-ink transition-opacity disabled:pointer-events-none disabled:opacity-25";

  return (
    <div className="group">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Aperçu des galeries — faites glisser, faites défiler ou utilisez les flèches pour explorer"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "reel-region flex h-[280px] cursor-grab items-stretch gap-4 overflow-x-auto overscroll-x-contain px-5 select-none active:cursor-grabbing sm:h-[360px] sm:px-8 lg:h-[400px]",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {images.map((img, n) => (
          // A plate on the wall — display only (no lightbox, no zoom). The figure is
          // the flex item: one shared height, width derived from its aspect ratio.
          <ImageFigure
            key={n}
            image={img}
            index={pad(n + 1)}
            className="h-full shrink-0"
            sizes="(min-width:1024px) 40vw, (min-width:640px) 55vw, 80vw"
          />
        ))}
      </div>

      {/* Minimal editorial controls — counter left, thin arrows right. Arrows fade
          in on hover/focus on desktop, stay visible on touch. */}
      <div className="mt-8 flex items-center justify-between gap-6 px-5 sm:px-8">
        <span
          aria-hidden
          className="text-xs tabular-nums tracking-[0.25em] text-muted"
        >
          {pad(index + 1)}
          <span className="mx-1.5 text-line">/</span>
          {pad(images.length)}
        </span>
        <div className="flex items-center gap-7 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => scrollToFrame(index - 1)}
            disabled={atStart}
            aria-label="Image précédente"
            className={arrow}
          >
            <span className="text-lg leading-none transition-transform duration-300 ease-[var(--ease-arrive)] group-hover/btn:-translate-x-1">
              ←
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollToFrame(index + 1)}
            disabled={atEnd}
            aria-label="Image suivante"
            className={arrow}
          >
            <span className="text-lg leading-none transition-transform duration-300 ease-[var(--ease-arrive)] group-hover/btn:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
