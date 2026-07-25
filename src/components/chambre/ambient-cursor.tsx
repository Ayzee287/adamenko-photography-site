"use client";

// ambient-cursor — the room reacting to presence. Writes CSS variables on <html> directly
// (no React state, no re-renders):
//
//   1. THE KEY LIGHT answers the pointer. A slow autonomous wander lives in CSS (the lamp
//      breathes even when the hand is still, on every device — free, GPU-composited). This
//      island only adds the cursor-reactive OFFSET on top, easing a heavily-inertial target
//      into --ch-lx / --ch-ly (vw/vh) so a warm pool drifts toward where you are, never
//      onto you. One rAF that runs ONLY while the light is still catching up, then parks
//      (idle = zero JS work — CSS keeps the room alive).
//   2. SCROLL DEPTH — a single 0→1 variable (--ch-scroll) the ambient uses to deepen and
//      warm the room, and drift the back-wall glow, as the visitor descends through the film.
//
// Without a fine pointer (touch) the follow is skipped — the CSS wander alone keeps the room
// breathing. Under reduced-motion nothing moves. Transform-only downstream (composited — no
// repaint, no blur). Renders nothing (no DOM, no hydration payload, no layout shift).

import { useEffect } from "react";

export function AmbientCursor() {
  useEffect(() => {
    const root = document.documentElement;

    // Scroll depth (0→1) — cheap, rAF-coalesced. Runs for every pointer type; only the
    // key-light follow below is gated to a fine pointer.
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        root.style.setProperty("--ch-scroll", p.toFixed(4));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) {
      // Touch / reduced-motion: no pointer follow. CSS owns whatever life there is.
      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(scrollRaf);
      };
    }

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;

    const tick = () => {
      // Heavy inertia: the light catches up slowly, then settles and the loop parks.
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      root.style.setProperty("--ch-lx", `${cx.toFixed(2)}vw`);
      root.style.setProperty("--ch-ly", `${cy.toFixed(2)}vh`);
      if (Math.abs(tx - cx) > 0.03 || Math.abs(ty - cy) > 0.03) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      // Answer presence partially (±15vw / ±15vh): the light leans toward your side of the
      // room, it never chases the cursor literally.
      tx = (e.clientX / window.innerWidth - 0.5) * 30;
      ty = (e.clientY / window.innerHeight - 0.5) * 30;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return null;
}
