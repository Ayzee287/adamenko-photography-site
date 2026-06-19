// The gallery content schema. Galleries are typed data, not a CMS (D009):
// adding a photo is one entry here + one export to /public/galleries/<genre>/.

/** The five genres (Q1 → split by genre, D007). Order here is nav/display order. */
export type GenreSlug =
  | "familles"
  | "grossesse"
  | "couples"
  | "portraits"
  | "mariages";

export type GalleryImage = {
  /**
   * Public path of the web export, e.g.
   * "/galleries/familles/familles_dupont_01.jpg".
   * Omit until the image is culled, graded, and exported — a photo-less entry
   * renders as an intentional reserved frame (no fabricated imagery).
   */
  src?: string;
  /** Intrinsic export size — REQUIRED when `src` is set (reserves space, CLS ≈ 0). */
  width?: number;
  height?: number;
  /** Meaningful French alt text — required for every real image (a11y + SEO). */
  alt: string;
  /** Aspect-ratio token for the frame, e.g. "aspect-[4/5]". Drives the layout rhythm. */
  ratio?: string;
  /**
   * Art-direction note shown only on a reserved (photo-less) frame: a quiet line
   * naming the photograph that belongs here and how it should feel — so the
   * placeholder directs rather than apologises (D021). Ignored once `src` is set.
   */
  hint?: string;
};

export type Gallery = {
  slug: GenreSlug;
  /** Display label (French). */
  title: string;
  /** One quiet line introducing the genre. */
  intro: string;
  /**
   * Curated, intentionally sequenced images. Empty until a set is ready —
   * a genre is simply not linked while empty (never shown padded, D007).
   */
  images: GalleryImage[];
};
