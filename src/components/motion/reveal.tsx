"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "rise" | "fade" | "rise-left" | "rise-slow";

/**
 * Reveals children as they scroll into view — without any hydration risk (D015).
 *
 * It renders **visible** on the server and at first client render (identical DOM,
 * no client-only attributes, no `typeof window` in render). Only AFTER mount does
 * it arm elements that are still **below the fold** — off-screen, so arming never
 * flashes — and transition them in on intersection. Above-the-fold content is left
 * visible (not animated on entry). Reduced motion → never arms. Pure enhancement:
 * with no JS, everything stays visible. Variants vary the feel so the page doesn't
 * reveal on one metronome (D016).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "rise",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // idle = visible (SSR + hydration) · armed = hidden off-screen · in = revealed.
  const [phase, setPhase] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const vh = window.innerHeight || 0;
    // Already in/above view at load → leave visible, no entry animation.
    if (el.getBoundingClientRect().top < vh * 0.92) return;

    setPhase("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPhase("in");
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
      data-variant={variant}
      className={cn(
        "reveal",
        phase === "armed" && "is-armed",
        phase === "in" && "is-revealed",
        className,
      )}
      style={
        delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
