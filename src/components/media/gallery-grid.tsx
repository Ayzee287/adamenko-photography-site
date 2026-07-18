"use client";

// gallery-grid — the sequence container (S5): a measured editorial column,
// never masonry; order = the photographer's edit, no layout algorithm.
// Vertical gaps space/6 mb / space/8 dt. This is the lightbox's client
// boundary ("keyed to the gallery sequence array" — census FE note): when
// interactive, every frame opens the shared Lightbox at its flat index.
// Stories compose ImageFrame/GalleryPair directly (server, NO lightbox —
// frozen story law).

import { useState } from "react";
import { ImageFrame, type ImageFrameProps } from "./image-frame";
import { GalleryPair } from "./gallery-pair";
import { Lightbox, type LightboxLabels } from "./lightbox";

type FrameData = Omit<ImageFrameProps, "interactive" | "onOpen" | "enlargeLabel">;

export type SequenceItem =
  | { kind: "single"; image: FrameData }
  | { kind: "pair"; loud: FrameData; quiet: FrameData; offset?: boolean };

export function GalleryGrid(props: {
  items: SequenceItem[];
  interactive?: boolean;
  labels?: LightboxLabels & { enlarge: string };
}) {
  const { items, interactive = false, labels } = props;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Flat image list in edit order — the lightbox's sequence array.
  const flat = items.flatMap((item) =>
    item.kind === "single" ? [item.image] : [item.loud, item.quiet],
  );

  let cursor = 0;
  const withLightbox = (image: FrameData): ImageFrameProps => {
    const index = cursor++;
    return interactive && labels
      ? {
          ...image,
          interactive: "lightbox",
          enlargeLabel: labels.enlarge,
          onOpen: () => setOpenIndex(index),
        }
      : image;
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {items.map((item, i) =>
        item.kind === "single" ? (
          <ImageFrame key={i} {...withLightbox(item.image)} />
        ) : (
          <GalleryPair
            key={i}
            loud={withLightbox(item.loud)}
            quiet={withLightbox(item.quiet)}
            offset={item.offset}
          />
        ),
      )}

      {interactive && labels && (
        <Lightbox
          images={flat.map(({ src, alt, caption }) => ({ src, alt, caption }))}
          index={openIndex ?? 0}
          open={openIndex !== null}
          onClose={() => setOpenIndex(null)}
          onNavigate={(i) => setOpenIndex(i)}
          labels={labels}
        />
      )}
    </div>
  );
}

export { GalleryPair };
