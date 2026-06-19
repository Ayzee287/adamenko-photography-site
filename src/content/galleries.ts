import type { Gallery, GalleryImage, GenreSlug } from "@/types/gallery";

// The five genre galleries (D007). Each is seeded with reserved frames (no `src`)
// so the layout and sequencing are real and reviewable now; real photographs drop
// in by adding `src` + `width`/`height` + alt, with no layout shift. No genre is
// shown padded — when a real set is ready it replaces these placeholders.
//
// Varied aspect ratios are intentional: they prove the grid handles a mixed,
// human edit (tall portraits next to wider frames) rather than a uniform tile grid.

const placeholder = (alt: string, ratio: string) => ({ alt, ratio });

export const galleries: Gallery[] = [
  {
    slug: "familles",
    title: "Familles",
    intro: "Le quotidien et les liens — à la maison, dehors, ensemble.",
    images: [
      placeholder("Photographie de famille", "aspect-[4/5]"),
      placeholder("Photographie de famille", "aspect-[3/2]"),
      placeholder("Photographie de famille", "aspect-[1/1]"),
      placeholder("Photographie de famille", "aspect-[4/5]"),
      placeholder("Photographie de famille", "aspect-[3/2]"),
      placeholder("Photographie de famille", "aspect-[5/4]"),
    ],
  },
  {
    slug: "grossesse",
    title: "Grossesse",
    intro: "L'attente, la douceur et l'intimité des semaines qui précèdent.",
    images: [
      placeholder("Photographie de grossesse", "aspect-[2/3]"),
      placeholder("Photographie de grossesse", "aspect-[4/5]"),
      placeholder("Photographie de grossesse", "aspect-[3/2]"),
      placeholder("Photographie de grossesse", "aspect-[4/5]"),
      placeholder("Photographie de grossesse", "aspect-[1/1]"),
      placeholder("Photographie de grossesse", "aspect-[2/3]"),
    ],
  },
  {
    slug: "couples",
    title: "Couples",
    intro: "Deux personnes, un lien — sans poses figées.",
    images: [
      placeholder("Photographie de couple", "aspect-[3/2]"),
      placeholder("Photographie de couple", "aspect-[4/5]"),
      placeholder("Photographie de couple", "aspect-[1/1]"),
      placeholder("Photographie de couple", "aspect-[3/2]"),
      placeholder("Photographie de couple", "aspect-[4/5]"),
      placeholder("Photographie de couple", "aspect-[5/4]"),
    ],
  },
  {
    slug: "portraits",
    title: "Portraits",
    intro: "Un visage, une présence — simple et juste.",
    images: [
      placeholder("Portrait", "aspect-[4/5]"),
      placeholder("Portrait", "aspect-[2/3]"),
      placeholder("Portrait", "aspect-[1/1]"),
      placeholder("Portrait", "aspect-[4/5]"),
      placeholder("Portrait", "aspect-[2/3]"),
      placeholder("Portrait", "aspect-[4/5]"),
    ],
  },
  {
    slug: "mariages",
    title: "Mariages",
    intro: "Le récit d'une journée — l'émotion plutôt que la mise en scène.",
    images: [
      placeholder("Photographie de mariage", "aspect-[3/2]"),
      placeholder("Photographie de mariage", "aspect-[2/3]"),
      placeholder("Photographie de mariage", "aspect-[3/2]"),
      placeholder("Photographie de mariage", "aspect-[1/1]"),
      placeholder("Photographie de mariage", "aspect-[4/5]"),
      placeholder("Photographie de mariage", "aspect-[3/2]"),
    ],
  },
];

/**
 * A curated cross-genre sequence for the homepage "reel" (HorizontalGallery).
 * Placeholders until real frames are exported — same reserved, no-CLS frames as
 * the genre galleries. Replace with the chosen signature frames from real shoots;
 * varied ratios are intentional (the reel reads as a hand-picked edit, not a grid).
 */
export const featured: GalleryImage[] = [
  { alt: "Photographie de famille", ratio: "aspect-[3/2]", hint: "Famille — un éclat de rire partagé." },
  { alt: "Photographie de grossesse", ratio: "aspect-[2/3]", hint: "Grossesse — contre-jour, ventre rond." },
  { alt: "Photographie de couple", ratio: "aspect-[16/10]", hint: "Couple — au grand large, main dans la main." },
  { alt: "Portrait", ratio: "aspect-[4/5]", hint: "Portrait — un visage, une présence." },
  { alt: "Photographie de mariage", ratio: "aspect-[3/2]", hint: "Mariage — l'échange des regards." },
  { alt: "Photographie de famille", ratio: "aspect-[4/5]", hint: "Famille — un enfant porté, tout contre." },
  { alt: "Photographie de couple", ratio: "aspect-[2/3]", hint: "Couple — front contre front." },
  { alt: "Photographie de mariage", ratio: "aspect-[16/10]", hint: "Mariage — la première danse, lumière basse." },
];

/** Ordered slugs for nav / static params. */
export const genreSlugs = galleries.map((g) => g.slug) as GenreSlug[];

/** Look up one gallery by slug. */
export function getGallery(slug: string): Gallery | undefined {
  return galleries.find((g) => g.slug === slug);
}
