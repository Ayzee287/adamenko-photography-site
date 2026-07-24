"use client";

// develop — the scroll-reveal primitive ("the print emerging from the developer").
// SSR-safe by construction: children render VISIBLE on the server and at hydration
// (identical DOM, zero mismatch). After mount the island arms ONLY elements that are
// still below the fold — so nothing above the fold, and nothing when JS is absent, is
// ever hidden — then reveals each on enter. GPU-only (opacity/transform/filter);
// reduced-motion is honoured here AND as a CSS backstop in chambre.css.

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export function Develop(props: {
  /** Stagger, ms — becomes the CSS transition-delay of the reveal. */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { delay = 0, className, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // Only arm what is genuinely below the fold at mount — never hide first paint.
    const vh = window.innerHeight || 0;
    if (el.getBoundingClientRect().top < vh * 0.9) return;

    el.classList.add("armed");
    if (delay) el.style.setProperty("--ch-delay", `${delay}ms`);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("shown");
            io.disconnect();
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn("ch-develop", className)}>
      {children}
    </div>
  );
}
