"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger in ms, applied as transition-delay. */
  delay?: number;
};

/**
 * Rises + fades its children in as they enter the viewport. The hidden initial
 * state lives in CSS gated on `html[data-js]` (motion.css) — so children are
 * server-rendered, indexable, and fully visible without JS; here we only toggle
 * the `is-inview` class. Observes once, then disconnects. Reduced motion is
 * handled entirely in CSS. Uses only opacity/transform → no layout shift.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IO (very old / non-DOM env): reveal on the next frame so content is
      // never stuck hidden — deferred, not a synchronous setState in the effect.
      const id = requestAnimationFrame(() => setInview(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInview(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", inview && "is-inview", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
