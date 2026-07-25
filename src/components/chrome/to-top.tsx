"use client";

// to-top — a quiet return-to-top control for CHAMBRE's long editorial pages (the
// homepage index, Tarifs, and the exhibition galleries all run well past a screen).
// It stays out of sight until the visitor is more than ~1.4 screens down, then fades
// in at the bottom corner. A click (or Enter/Space — it is a real <button>) glides
// back to the top and returns focus to the main landmark, so a keyboard visitor lands
// where they can Tab straight back into the header. Honours reduced-motion (jumps
// instead of gliding). It sits below the header, the overture and the top-layer
// dialogs (menu / lightbox), which cover it automatically while a modal is open, and
// reuses the single shared scroll subscription — no extra scroll listener.

import { useEffect, useState } from "react";
import { subscribeScroll } from "@/lib/scroll";

export function ToTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Reveal past ~1.4 screens; a hysteresis gap (re-hide only below ~0.7 screens)
    // keeps it from flickering while grazing the threshold.
    return subscribeScroll(() => {
      const trigger = window.innerHeight * 1.4;
      const y = window.scrollY;
      setShown((was) => (was ? y > trigger * 0.5 : y > trigger));
    });
  }, []);

  const toTop = () => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Hand focus back to the top of the document (the main landmark is tabindex=-1),
    // without letting the focus call fight the smooth scroll.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={label}
      className="ch-totop"
      data-shown={shown ? "true" : "false"}
      tabIndex={shown ? 0 : -1}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
