"use client";

import { useEffect, useRef, type TouchEvent } from "react";
import Image from "next/image";
import { blurFor } from "@/lib/image-blur";
import type { GalleryImage } from "@/types/gallery";

type LightboxProps = {
  images: GalleryImage[];
  /** Active image index, or null when closed. */
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * The immersive viewer — one component, reused by every gallery surface. Handles
 * keyboard (Esc / ← / →), scroll-lock while open, and touch-swipe; arrows + a
 * counter for the rest. Inverts its details on the dark surface (globals.css).
 */
export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const isOpen = index !== null;
  const touchX = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

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

  if (index === null) return null;
  const current = images[index];
  const count = images.length;
  // Blur-up: the photograph resolves from a soft preview of itself, not a flash.
  const blur = blurFor(current.src);

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

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu de la photographie"
      className="dark-surface fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="flex justify-end">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="text-sm uppercase tracking-[0.16em] text-paper/80 hover:text-paper"
        >
          Fermer ✕
        </button>
      </div>
      <div
        className="flex flex-1 items-center justify-center gap-2 sm:gap-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={onPrev}
          aria-label="Photographie précédente"
          className="shrink-0 px-2 text-3xl text-paper/70 hover:text-paper"
        >
          ‹
        </button>
        <Image
          src={current.src as string}
          alt={current.alt}
          width={current.width}
          height={current.height}
          sizes="(min-width:1024px) 80vw, 100vw"
          placeholder={blur ? "blur" : undefined}
          blurDataURL={blur}
          className="h-auto max-h-[85svh] w-auto max-w-full object-contain"
        />
        <button
          type="button"
          onClick={onNext}
          aria-label="Photographie suivante"
          className="shrink-0 px-2 text-3xl text-paper/70 hover:text-paper"
        >
          ›
        </button>
      </div>
      <p className="pt-3 text-center text-xs uppercase tracking-[0.16em] text-paper/60">
        {index + 1} / {count}
      </p>
      {/* Announce the current frame to screen readers as ‹/›/swipe change it. */}
      <p role="status" aria-live="polite" className="sr-only">
        {current.alt} · Photographie {index + 1} sur {count}
      </p>
    </div>
  );
}
