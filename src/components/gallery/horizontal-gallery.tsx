"use client";

import { useRef } from "react";
import { ImageFigure } from "@/components/ui/image-figure";
import { Lightbox } from "./lightbox";
import { useLightbox } from "./use-lightbox";
import type { GalleryImage } from "@/types/gallery";

/**
 * The homepage "reel" — a cinematic horizontal filmstrip the visitor explores
 * without leaving the page. Native scroll-snap gives touch-swipe + momentum for
 * free; the arrows drive it on desktop; clicking a frame opens the shared
 * Lightbox (keyboard + swipe). No autoplay — the visitor is always in control.
 */
export function HorizontalGallery({ images }: { images: GalleryImage[] }) {
  const { index, open, close, prev, next } = useLightbox(images.length);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.min(track.clientWidth * 0.8, 640) * dir;
    track.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={trackRef}
        aria-label="Aperçu des galeries — faites défiler"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, n) => (
          <button
            key={n}
            type="button"
            onClick={() => open(n)}
            aria-label={`Agrandir : ${img.alt}`}
            className="w-[80%] shrink-0 snap-center sm:w-[52%] lg:w-[36%]"
          >
            <ImageFigure
              image={img}
              index={String(n + 1).padStart(2, "0")}
              sizes="(min-width:1024px) 36vw, (min-width:640px) 52vw, 80vw"
            />
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="Voir les photographies précédentes"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-xl text-ink hover:border-clay"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="Voir les photographies suivantes"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-xl text-ink hover:border-clay"
        >
          ›
        </button>
      </div>

      <Lightbox
        images={images}
        index={index}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
