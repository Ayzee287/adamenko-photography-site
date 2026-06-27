"use client";

import { ImageFigure } from "@/components/ui/image-figure";
import { Lightbox } from "./lightbox";
import { useLightbox } from "./use-lightbox";
import type { GalleryImage } from "@/types/gallery";

/**
 * The genre gallery: a column-flow grid that handles a human edit of mixed aspect
 * ratios, opening the shared, keyboard- and touch-accessible Lightbox. The grid
 * items are the only interactive surface; transitions come from the global
 * interaction clock (globals.css), so nothing here sets its own.
 */
export function GalleryView({ images }: { images: GalleryImage[] }) {
  const { index, open, close, prev, next } = useLightbox(images.length);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img, n) => (
          <button
            key={n}
            type="button"
            onClick={() => open(n)}
            aria-label={`Agrandir : ${img.alt}`}
            className="mb-4 block w-full break-inside-avoid"
          >
            <ImageFigure
              image={img}
              index={String(n + 1).padStart(2, "0")}
              priority={n === 0}
            />
          </button>
        ))}
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
