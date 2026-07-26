"use client";

// lightbox — the viewing room: a premium single-photograph viewer, so opening one frame
// lets you browse the whole shoot. Built on the native <dialog> (top layer, focus trap,
// Escape and focus-return for free), then given the interactions a photographer expects:
//
//   • navigate — arrow buttons, ← → keys, Home/End, and on touch a natural horizontal
//     swipe (the image follows the finger, commits past a threshold, snaps back otherwise);
//   • dismiss — the close button, Escape, a tap on the dark surround, or a swipe DOWN;
//   • orientation — portrait and landscape both sit in one fixed stage (object-contain), so
//     moving between a tall frame and a wide one never makes the layout jump;
//   • transition — the next frame eases in FROM the travel direction, so the sequence has
//     a sense of direction rather than a hard cut;
//   • presence — a quiet counter + hairline progress make it obvious more frames exist,
//     without any of the gallery-wall numbering;
//   • restraint — the chrome fades away after a moment of stillness and returns on the next
//     move or tap, so the photograph is alone as much as possible;
//   • loading — blur-up placeholders, and the neighbours are preloaded so a swipe is instant.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { blurMap } from "@/lib/image-blur";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface LightboxLabels {
  dialog: string;
  close: string;
  closeLabel: string;
  prevPhoto: string;
  nextPhoto: string;
  photograph: string;
  of: string;
}

const SWIPE_COMMIT = 60; // px past which a horizontal swipe changes photograph
const DISMISS_COMMIT = 110; // px of downward swipe that closes the viewer
const IDLE_HIDE = 2800; // ms of stillness before the chrome fades

export function Lightbox(props: {
  images: LightboxImage[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  labels: LightboxLabels;
}) {
  const { images, index, open, onClose, onNavigate, labels } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const current = images[index];

  const [dir, setDir] = useState<1 | -1>(1); // travel direction, for the enter animation
  const [chromeOn, setChromeOn] = useState(true);
  const idleTimer = useRef<number | null>(null);

  // Re-show the chrome whenever the viewer (re)opens — adjusted during render (React's
  // "reset state on prop change" pattern), never in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setChromeOn(true);
  }

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setDir(delta > 0 ? 1 : -1);
      onNavigate((index + delta + count) % count);
    },
    [count, index, onNavigate],
  );

  // Open/close the native dialog in step with `open`.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Preload the two neighbours each side so a swipe or arrow is instant.
  useEffect(() => {
    if (!open || count < 2) return;
    for (const n of [index - 1, index + 1, index - 2, index + 2]) {
      const neighbour = images[(n + count) % count];
      if (neighbour) new window.Image().src = neighbour.src;
    }
  }, [open, index, count, images]);

  // Chrome auto-hide: any pointer move / key press wakes it; stillness fades it. `wake`
  // runs from user events (showing the chrome immediately); the effect only (re)starts the
  // idle countdown when the viewer opens or the frame changes — its setState is deferred
  // into the timer callback, so it is not a synchronous set-state-in-effect.
  const wake = useCallback(() => {
    setChromeOn(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setChromeOn(false), IDLE_HIDE);
  }, []);
  useEffect(() => {
    if (!open) return;
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setChromeOn(false), IDLE_HIDE);
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [open, index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    wake();
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "Home") {
      setDir(-1);
      onNavigate(0);
    } else if (e.key === "End") {
      setDir(1);
      onNavigate(count - 1);
    }
  };

  // ── touch / pointer drag ──────────────────────────────────────────────────────────
  const drag = useRef<{ id: number; x: number; y: number; active: boolean; axis: null | "x" | "y" }>(
    { id: -1, x: 0, y: 0, active: false, axis: null },
  );
  const setStage = (t: string, transition = false) => {
    const el = stageRef.current;
    if (!el) return;
    el.style.transition = transition ? "transform 0.32s var(--ch-ease, cubic-bezier(0.16,1,0.3,1)), opacity 0.32s" : "none";
    el.style.transform = t;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, active: true, axis: null };
    setStage("none");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    wake();
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis && Math.hypot(dx, dy) > 8) d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (d.axis === "x") {
      const resist = count < 2 ? 0.25 : 1;
      setStage(`translateX(${dx * resist}px)`);
    } else if (d.axis === "y" && dy > 0) {
      const k = Math.min(1, dy / 320);
      setStage(`translateY(${dy}px) scale(${1 - k * 0.06})`);
      const el = stageRef.current;
      if (el) el.style.opacity = String(1 - k * 0.55);
    }
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    d.active = false;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const el = stageRef.current;
    if (el) el.style.opacity = "";
    if (d.axis === "y" && dy > DISMISS_COMMIT) {
      onClose();
      return;
    }
    if (d.axis === "x" && Math.abs(dx) > SWIPE_COMMIT && count > 1) {
      go(dx < 0 ? 1 : -1); // index change remounts the slide, which plays its enter anim
      return;
    }
    setStage("translateX(0)", true); // snap back
  };

  // Tap on the dark surround (not the photo or a control) closes.
  const onBackdrop = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.backdrop === "true") onClose();
  };

  if (count === 0) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={onKeyDown}
      aria-label={labels.dialog}
      className="lb"
      data-chrome={chromeOn ? "on" : "off"}
    >
      <div
        className="lb-inner"
        data-backdrop="true"
        onClick={onBackdrop}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="lb-stage" ref={stageRef} data-backdrop="true">
          <figure key={index} className="lb-slide" data-dir={dir}>
            {/* Only while OPEN. The viewer sits closed on every gallery page, and rendering its
                first frame regardless made `priority` emit a preload for a 100vw photograph
                nobody had asked to see — a wasted full-width download on each visit, and (at
                DPR 1) an unused preload the page then waited on, so `load` never fired. */}
            {open && current && (
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                // 85 is the quality `next.config.ts` reserves for this surface. It must be a
                // value from `images.qualities`: an unlisted one (this asked for 88) is not
                // silently clamped — the optimizer answers 400 and the viewer is left holding
                // a preload that never resolves.
                quality={85}
                className="lb-img"
                priority
                {...(blurMap[current.src]
                  ? { placeholder: "blur" as const, blurDataURL: blurMap[current.src] }
                  : {})}
              />
            )}
          </figure>
        </div>

        <button type="button" onClick={onClose} aria-label={labels.close} className="lb-btn lb-close">
          <svg viewBox="0 0 24 24" aria-hidden width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={labels.prevPhoto} className="lb-btn lb-prev">
              <svg viewBox="0 0 24 24" aria-hidden width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" onClick={() => go(1)} aria-label={labels.nextPhoto} className="lb-btn lb-next">
              <svg viewBox="0 0 24 24" aria-hidden width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="lb-meta">
          {current?.caption && <p className="lb-caption">{current.caption}</p>}
          {count > 1 && (
            <>
              <p className="lb-counter">
                <span className="sr-only">{labels.photograph} </span>
                <span className="lb-counter-i">{index + 1}</span>
                <span aria-hidden> / </span>
                <span className="sr-only">{labels.of} </span>
                {count}
              </p>
              <div className="lb-progress" aria-hidden>
                <span style={{ transform: `scaleX(${(index + 1) / count})` }} />
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
