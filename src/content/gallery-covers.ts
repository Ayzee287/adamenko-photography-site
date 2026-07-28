// Which photograph advertises a genre on /galeries — deliberately NOT inside
// content/galleries.ts.
//
// WHERE: galleries.ts / galleries.en.ts are AUTO-GENERATED from curation/collections.txt by
// scripts/photos-build.mjs, and the frame that file calls `cover:` is also the OPENING frame
// of that curated hang. Those are two different jobs. The opening frame answers "how does
// this series begin"; the /galeries plate answers "which genre is this", to a visitor
// comparing four plates side by side who has read nothing yet. Same reasoning, same place in
// the architecture as content/gallery-meta.ts.
//
// WHY it exists at all — the Mariages plate. Its cover (`mariages-a00`, a seaside elopement:
// lace dress, white dinner jacket, no veil, no bouquet, no guests, no ceremony) is a real
// wedding photograph and a good one, but on a wall where it is compared against Familles, Grossesse
// and Couples it reads as a couple séance — the 21/9 band gives two thirds of the frame to sea
// and ferns and leaves the two figures unlabelled. On /prestations/mariage the same photograph
// reads correctly, because an <h1> saying "Photographe de mariage à Lyon" is doing the
// labelling. The index has no such context, which is why the override lives here and not
// there.
//
// SCOPE — the /galeries plate only. The curated hang, its opening frame, the homepage genre
// tiles and the service dossiers are each owned elsewhere and are untouched by this file.
// An entry is a photographic decision: promote a frame only when it names its genre faster
// than the cover does, and aim `focus` from what is actually in the picture.

import type { GenreSlug } from "@/types/gallery";

/**
 * A genre's plate on the galleries index. `focus` is a CSS object-position, because the plate
 * is a 21/9 band and every candidate here is a 3/2 photograph — the middle 64% by default,
 * which is rarely where the subject is.
 *
 * A frame under /stories is a published story's own photograph: promoting one also needs its
 * path in ALWAYS_INCLUDE in scripts/gen-blur.mjs, or this plate is the only one on the wall
 * that pops in instead of blurring up.
 */
export const galleryCovers: Partial<Record<GenreSlug, { src: string; focus?: string }>> = {
  // The cover of the "Deux jours de fête" reportage. A floor-length gown with its cape carried
  // across the whole frame, a groom on one knee in black tie, a château terrace — it says
  // WEDDING before it is read, and it is composed horizontally, so the cinematic band is the
  // format it wants rather than the one it survives. Aimed at 42%: at 50% the bride's head sat
  // on the crop line, and the grass it trades away carries nothing.
  mariages: { src: "/stories/mariages/mariages-4/mariages-4-66.jpg", focus: "50% 42%" },
};
