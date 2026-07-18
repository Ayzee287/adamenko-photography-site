"use client";

// Header scroll behavior (Architecture §12, UX Blueprint chrome law):
// hide after 120px of downward travel, return on the first upward intent
// (≥8px — the threshold exists to survive iOS rubber-band jitter), always
// visible near the top, and ALWAYS revealed when focus enters the header
// (Addendum M4 — the component wires reveal() to onFocus/focusin).
//
// rAF-throttled; the pure reducer is exported for contract tests.

import { useCallback, useEffect, useRef, useState } from "react";

export const HIDE_TRAVEL = 120;
export const REVEAL_TRAVEL = 8;

export interface ScrollState {
  hidden: boolean;
  lastY: number;
  downTravel: number;
  upTravel: number;
}

export const initialScrollState: ScrollState = {
  hidden: false,
  lastY: 0,
  downTravel: 0,
  upTravel: 0,
};

/** Pure reducer — derive the next header state from a scroll position.
 *  (Derive, never store from render-phase measurement — the V1 header-tone
 *  lesson, encoded as a design rule for all header state.) */
export function reduceScroll(state: ScrollState, rawY: number): ScrollState {
  const y = Math.max(0, rawY); // clamp rubber-band negatives
  const delta = y - state.lastY;

  // Near the top the header is always visible and travel resets.
  if (y <= HIDE_TRAVEL) {
    return { hidden: false, lastY: y, downTravel: 0, upTravel: 0 };
  }

  if (delta > 0) {
    const downTravel = state.downTravel + delta;
    return {
      hidden: state.hidden || downTravel >= HIDE_TRAVEL,
      lastY: y,
      downTravel,
      upTravel: 0,
    };
  }

  if (delta < 0) {
    const upTravel = state.upTravel + -delta;
    return {
      hidden: upTravel >= REVEAL_TRAVEL ? false : state.hidden,
      lastY: y,
      downTravel: upTravel >= REVEAL_TRAVEL ? 0 : state.downTravel,
      upTravel,
    };
  }

  return state;
}

export function useScrollDirection(): {
  hidden: boolean;
  /** Force-visible (header calls this on focus entering it — M4). */
  reveal: () => void;
} {
  const [hidden, setHidden] = useState(false);
  const stateRef = useRef<ScrollState>(initialScrollState);
  const ticking = useRef(false);

  const reveal = useCallback(() => {
    stateRef.current = {
      ...stateRef.current,
      hidden: false,
      downTravel: 0,
      upTravel: 0,
    };
    setHidden(false);
  }, []);

  useEffect(() => {
    stateRef.current = reduceScroll(initialScrollState, window.scrollY);
    setHidden(stateRef.current.hidden);

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        const next = reduceScroll(stateRef.current, window.scrollY);
        if (next.hidden !== stateRef.current.hidden) setHidden(next.hidden);
        stateRef.current = next;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { hidden, reveal };
}
