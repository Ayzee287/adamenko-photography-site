"use client";

// Dev-only interactive gallery demo: sequence → grid → lightbox, with the
// production labels (V1 ui strings).

import { GalleryGrid } from "@/components/media/gallery-grid";

const labels = {
  enlarge: "Agrandir",
  dialog: "Aperçu de la photographie",
  close: "Fermer",
  closeLabel: "Fermer ✕",
  prevPhoto: "Photographie précédente",
  nextPhoto: "Photographie suivante",
  photograph: "Photographie",
  of: "sur",
};

export function GalleryDemo() {
  return (
    <div className="max-w-image-col">
      <GalleryGrid
        interactive
        labels={labels}
        items={[
          {
            kind: "single",
            image: {
              src: "/galleries/familles/familles-01.jpg",
              alt: "Une mère et son enfant, front contre front.",
              ratio: "3:2",
            },
          },
          {
            kind: "pair",
            offset: true,
            loud: {
              src: "/galleries/couples/couples-03.jpg",
              alt: "Un couple dans la lumière du soir.",
              ratio: "3:2",
            },
            quiet: {
              src: "/galleries/couples/couples-04.jpg",
              alt: "Deux mains qui se tiennent.",
              ratio: "4:5",
              caption: "Le mouvement plutôt que la pose.",
            },
          },
          {
            kind: "single",
            image: {
              src: "/galleries/couples/couples-05.jpg",
              alt: "Un éclat de rire partagé.",
              ratio: "3:2",
            },
          },
        ]}
      />
    </div>
  );
}
