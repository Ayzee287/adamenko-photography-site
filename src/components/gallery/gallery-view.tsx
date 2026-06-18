"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageFigure } from "@/components/ui/image-figure";
import type { GalleryImage } from "@/types/gallery";

/**
 * The gallery: a column-flow grid that handles a human edit of mixed aspect
 * ratios, plus a lightweight, keyboard-accessible lightbox. The grid items are
 * the only interactive surface; transitions come from the global interaction
 * clock (globals.css), so nothing here sets its own.
 */
export function GalleryView({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const count = images.length;

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((n) => (n === null ? n : (n - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setOpenIndex((n) => (n === null ? n : (n + 1) % count)),
    [count],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img, n) => (
          <button
            key={n}
            type="button"
            onClick={() => setOpenIndex(n)}
            aria-label={`Agrandir : ${img.alt}`}
            className="mb-4 block w-full break-inside-avoid"
          >
            <ImageFigure image={img} index={String(n + 1).padStart(2, "0")} />
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photographie"
          className="dark-surface fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 sm:p-8"
          onClick={close}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="text-sm uppercase tracking-[0.16em] text-paper/80 hover:text-paper"
            >
              Fermer ✕
            </button>
          </div>
          <div
            className="flex flex-1 items-center justify-center gap-2 sm:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={prev}
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
              onClick={next}
              aria-label="Photographie suivante"
              className="shrink-0 px-2 text-3xl text-paper/70 hover:text-paper"
            >
              ›
            </button>
          </div>
          <p className="pt-3 text-center text-xs uppercase tracking-[0.16em] text-paper/60">
            {(openIndex ?? 0) + 1} / {count}
          </p>
        </div>
      ) : null}
    </>
  );
}
