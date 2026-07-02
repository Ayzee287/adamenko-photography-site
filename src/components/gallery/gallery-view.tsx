"use client";

import { ImageFigure } from "@/components/ui/image-figure";
import { Lightbox } from "./lightbox";
import { useLightbox } from "./use-lightbox";
import type { GalleryImage } from "@/types/gallery";
import type { GalleryStrings } from "./lightbox";

/**
 * The genre gallery: a column-flow grid that handles a human edit of mixed aspect
 * ratios, opening the shared, keyboard- and touch-accessible Lightbox. The grid
 * items are the only interactive surface; transitions come from the global
 * interaction clock (globals.css), so nothing here sets its own. Accessible strings
 * are passed in (locale-resolved) so this client island never imports the dictionary.
 *
 * Reserved frames (B3): the content model allows a photo-less entry (an intentional
 * reserved frame — types/gallery.ts). Those hang in the grid like any plate but are
 * NOT part of the lightbox set: they render display-only (no button, no affordance),
 * and the viewer navigates real photographs only, so it can never be opened on a
 * frame with nothing to show.
 */
export function GalleryView({
  images,
  t,
}: {
  images: readonly GalleryImage[];
  t: GalleryStrings;
}) {
  // The viewer's set — real photographs only, in hang order. Each slot keeps its
  // index into this set (null for reserved frames) so a click opens the lightbox
  // on the right photo even with reserved frames interleaved.
  const photos = images.filter(
    (img): img is GalleryImage & { src: string } => Boolean(img.src),
  );
  let nextPhoto = 0;
  const slots = images.map((img) => ({
    img,
    photoIndex: img.src ? nextPhoto++ : null,
  }));

  const { index, open, close, prev, next } = useLightbox(photos.length);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {slots.map(({ img, photoIndex }, n) => {
          const figure = (
            <ImageFigure
              image={img}
              index={String(n + 1).padStart(2, "0")}
              priority={n === 0}
            />
          );
          // Plate index runs over the whole hang (reserved frames included); only
          // real photographs are wrapped in the enlarge affordance.
          return photoIndex === null ? (
            <div key={n} className="mb-4 w-full break-inside-avoid">
              {figure}
            </div>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => open(photoIndex)}
              aria-label={`${t.enlarge} : ${img.alt}`}
              className="mb-4 block w-full break-inside-avoid"
            >
              {figure}
            </button>
          );
        })}
      </div>

      <Lightbox
        images={photos}
        index={index}
        onClose={close}
        onPrev={prev}
        onNext={next}
        t={t}
      />
    </>
  );
}
