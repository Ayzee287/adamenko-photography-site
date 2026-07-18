"use client";

// The settle's trigger (Motion Foundation): IntersectionObserver, ONCE per
// element per page load — reveals never re-trigger on scroll-up. Under
// prefers-reduced-motion the element is revealed immediately (Foundations §5:
// "renders children inert-visible"); environments without IO reveal
// immediately too (content is never hostage to an API).
//
// The hook returns { ref, revealed }; the CSS layer (P3 tokens + P18 moves)
// owns duration/distance — this hook owns only the boolean.

import { useEffect, useRef, useState } from "react";

export const REVEAL_THRESHOLD = 0.2;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useReveal<T extends HTMLElement = HTMLElement>(): {
  ref: React.RefObject<T | null>;
  revealed: boolean;
} {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      // Deferred one frame: immediate for the user, async for React
      // (react-hooks/set-state-in-effect — no cascading sync render).
      const id = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true); // once — never unset
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return { ref, revealed };
}
