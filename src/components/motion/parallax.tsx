"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { subscribeScroll } from "@/lib/scroll";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type ParallaxProps = {
  children: ReactNode;
  /** Drift strength as a fraction of viewport height; small is tasteful. */
  speed?: number;
  /** Clamp on the translate, in px. */
  max?: number;
  className?: string;
};

/**
 * Drift: translates its children slightly against the scroll for depth.
 * Subscribes to the single shared scroll source (lib/scroll) and writes only a
 * `transform` (compositor-only — no reflow, no CLS). Off under reduced motion
 * and inert without JS. Callers disable it on small viewports via `speed={0}`.
 */
export function Parallax({ children, speed = 0.1, max = 28, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || speed === 0) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -0.5 (entering from below) → +0.5 (leaving at top); 0 when centered.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const offset = Math.max(-max, Math.min(max, -progress * speed * vh));
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const unsub = subscribeScroll(update);
    return () => {
      unsub();
      el.style.transform = "";
    };
  }, [reduced, speed, max]);

  return (
    <div ref={ref} className={cn("parallax", className)}>
      {children}
    </div>
  );
}
