"use client";

import { useEffect, useRef, type TouchEvent } from "react";
import { ImageFigure } from "@/components/ui/image-figure";
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (index === null) return null;
  const current = images[index];
  const count = images.length;

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
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu de la photographie"
      className="dark-surface fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="flex justify-end">
        <button
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
        <div className="w-full max-w-3xl">
          <ImageFigure image={current} sizes="(min-width:768px) 768px, 100vw" />
        </div>
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
    </div>
  );
}
