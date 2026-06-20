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
 * A curated cross-genre sequence for the homepage reel (HorizontalGallery) — an
 * exhibition wall of DIRECTED placeholders (v3): no demo imagery, every frame is a
 * reserved no-CLS frame carrying its orientation·ratio + a one-line art-direction
 * note. The mixed ratios + emotional sequence are the curation; widths derive from
 * each ratio at the shared rail height, so it reads as a hand-picked hang, not a
 * grid. Drop a real frame in by adding `src` (+ `width`/`height`) — zero layout
 * change. Order is the edit: it should rise and fall like a wall you walk past.
 */
export const featured: GalleryImage[] = [
  { alt: "Une étreinte avant le coucher du soleil", ratio: "aspect-[4/5]", hint: "Une étreinte avant le coucher du soleil." },
  { alt: "Une famille marchant vers la mer", ratio: "aspect-[16/9]", hint: "Une famille marchant vers la mer." },
  { alt: "Des mains qui se cherchent", ratio: "aspect-[1/1]", hint: "Des mains qui se cherchent." },
  { alt: "Le premier regard, à la fenêtre", ratio: "aspect-[3/4]", hint: "Le premier regard, à la fenêtre." },
  { alt: "Des enfants courent dans l'herbe haute", ratio: "aspect-[3/2]", hint: "Des enfants qui courent dans l'herbe haute." },
  { alt: "Une future maman, de profil", ratio: "aspect-[2/3]", hint: "Une future maman, de profil." },
  { alt: "Le rire partagé au milieu du repas", ratio: "aspect-[5/4]", hint: "Le rire partagé, au milieu du repas." },
  { alt: "Front contre front, les yeux fermés", ratio: "aspect-[4/5]", hint: "Front contre front, les yeux fermés." },
  { alt: "La mariée, juste avant d'entrer", ratio: "aspect-[16/9]", hint: "La mariée, juste avant d'entrer." },
  { alt: "Un nouveau-né au creux des bras", ratio: "aspect-[1/1]", hint: "Un nouveau-né, au creux des bras." },
];

/** Ordered slugs for nav / static params. */
export const genreSlugs = galleries.map((g) => g.slug) as GenreSlug[];

/** Look up one gallery by slug. */
export function getGallery(slug: string): Gallery | undefined {
  return galleries.find((g) => g.slug === slug);
}
