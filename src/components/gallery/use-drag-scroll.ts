"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

/**
 * THE drag-to-scroll physics of the site — extracted verbatim from the featured
 * reel (v4) so every horizontal surface shares one interaction clock:
 *
 *   - mouse drag with momentum/inertia on release (decay 0.92/frame);
 *   - touch/pen left to native momentum scroll;
 *   - horizontal-intent wheel (trackpad swipe / shift+wheel) scrolls the strip,
 *     a plain vertical wheel is left to the page — the strip never traps scroll;
 *   - native image/link drag cancelled, so a drag stays a SCROLL gesture
 *     (no browser ghost, no pointercancel mid-drag);
 *   - primary button only — a right-click (context menu) must never arm the
 *     drag state, or the next unpressed pointermove would scroll on its own;
 *   - reduced motion drops the inertia (instant stop on release).
 *
 * The caller spreads `dragHandlers` onto its scroller element and may call
 * `stopInertia()` before its own programmatic scrolls (arrows / keyboard).
 */
export function useDragScroll(scrollerRef: React.RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();

  // Drag state (mouse) + last-sample velocity for inertia.
  const drag = useRef<
    | { x: number; left: number; moved: boolean; lastX: number; lastT: number; v: number }
    | null
  >(null);
  const justDragged = useRef(false);
  const inertiaRaf = useRef(0);

  const stopInertia = () => {
    if (inertiaRaf.current) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = 0;
    }
  };

  // Stop a pending inertia frame when the surface unmounts.
  useEffect(() => stopInertia, []);

  // Wheel → horizontal, but only for HORIZONTAL intent. Attached manually because
  // React's onWheel is passive (preventDefault would be ignored).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → let page scroll
      if (e.deltaX === 0) return;
      e.preventDefault();
      stopInertia();
      el.scrollLeft += e.deltaX;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return; // touch/pen use native momentum scroll
    if (e.button !== 0) return; // primary button only (see header comment)
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
    // NOTE: the pointer is NOT captured here. Capturing on pointerdown retargets
    // the eventual `click` to the scroller, so a child control (a card's "read
    // more") could never be pressed. Capture starts lazily below, once the
    // gesture has actually become a drag.
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 3) {
      d.moved = true;
      // A real drag: capture so the strip keeps tracking when the pointer leaves
      // it. The post-drag click retargets to the scroller and is swallowed by
      // onClickCapture — a stationary press (no capture) clicks children normally.
      el.setPointerCapture?.(e.pointerId);
    }
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
    // Remember whether this gesture actually dragged: the click that follows a
    // real drag is an accident of the pointer model, not intent — the capture
    // handler below swallows it so a drag can never "press" a child control.
    justDragged.current = !!d?.moved;
    if (!el || !d || reduced) return;
    let v = d.v * 16; // px/ms → ~px/frame
    if (Math.abs(v) < 0.5) return;
    const step = () => {
      el.scrollLeft -= v;
      v *= 0.92; // decay → natural stop
      if (Math.abs(v) > 0.3) {
        inertiaRaf.current = requestAnimationFrame(step);
      } else {
        inertiaRaf.current = 0;
      }
    };
    inertiaRaf.current = requestAnimationFrame(step);
  };

  return {
    stopInertia,
    reduced,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      // The strip's children may be natively draggable (<img>). Cancelling
      // dragstart keeps a mouse drag a scroll gesture — no OS ghost image.
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      // Swallow the synthetic click that follows a real drag (see onPointerUp),
      // so dragging across a child button/link never activates it. Keyboard
      // activation is unaffected — it never sets justDragged.
      onClickCapture: (e: React.MouseEvent) => {
        if (justDragged.current) {
          justDragged.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
  };
}
