"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Image, { getImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { blurFor } from "@/lib/image-blur";
import type { GalleryImage } from "@/types/gallery";
import type { Dictionary } from "@/content/dictionaries/fr";

/** The locale-resolved gallery/lightbox strings, passed from a server parent. */
export type GalleryStrings = Dictionary["ui"]["gallery"];

type LightboxProps = {
  images: readonly GalleryImage[];
  /** Active image index, or null when closed. */
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  t: GalleryStrings;
};

/**
 * The immersive viewer — one component, reused by every gallery surface. Handles
 * keyboard (Esc / ← / →), scroll-lock while open, and touch-swipe; arrows + a
 * counter for the rest. Inverts its details on the dark surface (globals.css).
 *
 * Open/close is a quiet opacity fade — the mount/shown state machine mirrors the
 * mobile-menu overlay (same `--ease-arrive`, same 300ms) so this dialog reads as
 * the same authored system, not a bolted-on effect (closes gallery review G8).
 */
export function Lightbox({ images, index, onClose, onPrev, onNext, t }: LightboxProps) {
  const isOpen = index !== null;
  const touchX = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // mounted = in the DOM (kept through the exit fade); shown = the visible CSS
  // state, flipped a frame after mount so the entrance transitions.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  // The last real index — kept so the exit fade still has a frame to render once
  // the parent has already cleared `index` to null.
  const [lastIndex, setLastIndex] = useState(0);

  if (isOpen && !mounted) setMounted(true);
  if (index !== null && index !== lastIndex) setLastIndex(index);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const raf = requestAnimationFrame(() => setShown(false));
    // Safety net: unmount even if the dialog's transitionend never arrives (e.g.
    // reduced-motion near-zero durations, or an interrupted transition).
    const timer = setTimeout(() => setMounted(false), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Take the page behind the dialog out of the a11y tree and interaction while it is
  // open — the mobile menu's belt-and-braces with aria-modal, applied to the second
  // dialog (06). Possible only because the dialog PORTALS to <body> (below): rendered
  // in place it lives inside <main>, and inert-ing main would inert the dialog itself.
  // Keyed on isOpen (not mounted) and declared BEFORE the focus effect, so on close
  // this cleanup un-inerts main first and the focus restore below can land on the
  // opener — .focus() on an element inside an inert subtree is silently ignored.
  useEffect(() => {
    if (!isOpen) return;
    const background = ["main", "header", "footer"].map((sel) =>
      document.querySelector(sel),
    );
    background.forEach((el) => el?.setAttribute("inert", ""));
    return () => background.forEach((el) => el?.removeAttribute("inert"));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Remember what had focus so we can restore it when the dialog closes.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "Tab") {
        // Trap focus inside the modal.
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into the dialog so keyboard users start inside it.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!mounted) return null;
  const displayIndex = index ?? lastIndex;
  const current = images[displayIndex];
  const count = images.length;
  // Blur-up: the photograph resolves from a soft preview of itself, not a flash.
  const blur = blurFor(current.src);

  // Preload the adjacent frames so ‹/› feels instant (gallery review G7). Resolved
  // through next/image's own `getImageProps` — not a hand-built URL — so the
  // preloaded srcset is the exact one the Image below will request on navigation,
  // then rendered as a plain <link>, which React hoists into <head>.
  const lightboxImageProps = {
    width: current.width,
    height: current.height,
    quality: 85,
    sizes: "(min-width:1024px) 80vw, 100vw",
  };
  const preloadLinks =
    index !== null && count > 1
      ? Array.from(new Set([(displayIndex - 1 + count) % count, (displayIndex + 1) % count]))
          .map((n) => images[n])
          .filter((img): img is GalleryImage & { src: string } => Boolean(img?.src))
          .map((img) => {
            const {
              props: { srcSet, sizes },
            } = getImageProps({ ...lightboxImageProps, src: img.src, alt: "" });
            return { key: img.src, srcSet, sizes };
          })
      : [];

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) onNext();
      else onPrev();
    }
    touchX.current = null;
  };

  // Portalled to <body>: the dialog must be a SIBLING of main/header/footer for the
  // inert treatment above (and mounts only after a click, so document exists).
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.lightbox}
      onTransitionEnd={(e) => {
        // Only the dialog's own opacity transition ends the close → unmount.
        if (e.target === dialogRef.current && !isOpen) setMounted(false);
      }}
      className={cn(
        "dark-surface fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 transition-opacity duration-300 ease-[var(--ease-arrive)] sm:p-8",
        shown ? "opacity-100" : "opacity-0",
      )}
      onClick={onClose}
    >
      {preloadLinks.map(({ key, srcSet, sizes }) => (
        <link key={key} rel="preload" as="image" imageSrcSet={srcSet} imageSizes={sizes} />
      ))}
      <div className="flex justify-end">
        {/* Invisible -m/p pairs pad the text to a ≥44px hit area without moving a
            pixel — the header trigger / social-links pattern (04). */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="-m-3 p-3 text-sm uppercase tracking-meta text-paper/80 hover:text-paper"
        >
          {t.closeLabel}
        </button>
      </div>
      <div
        className="flex flex-1 items-center justify-center gap-2 sm:gap-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* 44px paddles (04): an explicit h-11/w-11 box, glyph centred — the visual
            weight is unchanged, only the hit area grows. */}
        <button
          type="button"
          onClick={onPrev}
          aria-label={t.prevPhoto}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-3xl text-paper/70 hover:text-paper"
        >
          ‹
        </button>
        <Image
          // Keying on the index remounts the frame so it settles in fresh on every
          // navigation, reusing the same "photograph fades in" primitive every
          // other real image on the site already uses — not a new motion.
          key={displayIndex}
          src={current.src as string}
          alt={current.alt}
          width={current.width}
          height={current.height}
          quality={85}
          sizes="(min-width:1024px) 80vw, 100vw"
          placeholder={blur ? "blur" : undefined}
          blurDataURL={blur}
          className="motion-image-fade h-auto max-h-[85svh] w-auto max-w-full object-contain"
        />
        <button
          type="button"
          onClick={onNext}
          aria-label={t.nextPhoto}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-3xl text-paper/70 hover:text-paper"
        >
          ›
        </button>
      </div>
      <p className="pt-3 text-center text-xs uppercase tracking-meta text-paper/60">
        {displayIndex + 1} / {count}
      </p>
      {/* Announce the current frame to screen readers as ‹/›/swipe change it. */}
      <p role="status" aria-live="polite" className="sr-only">
        {current.alt} · {t.photograph} {displayIndex + 1} {t.of} {count}
      </p>
    </div>,
    document.body,
  );
}
