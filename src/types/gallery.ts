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
   * Short title shown on a reserved (photo-less) frame — the subject the frame is
   * reserved for, e.g. "Le lien", "Portrait". Sits under the orientation·ratio
   * caption so the placeholder reads as a directed art-board, not an empty field.
   * Ignored once `src` is set.
   */
  label?: string;
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
   * Single cover frame for the /galeries index (the genre's face on the contact
   * sheet). A reserved frame until a real photo lands — drops in with no layout
   * change, like any GalleryImage. Falls back to the first `images` entry if unset.
   */
  cover?: GalleryImage;
  /**
   * Curated, intentionally sequenced images. Empty until a set is ready —
   * a genre is simply not linked while empty (never shown padded, D007).
   */
  images: GalleryImage[];
};
