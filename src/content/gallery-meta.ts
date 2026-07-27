// Gallery SEO metadata — deliberately NOT inside content/galleries.ts.
//
// WHERE: galleries.ts and galleries.en.ts are AUTO-GENERATED from curation/collections.txt
// by scripts/photos-build.mjs, and that sheet is edited continuously while the shoots are
// being selected. A title hand-written into a generated file would survive exactly until
// the next `npm run photos:build`. It also does not belong there on its own merits: which
// frames hang, in which order, with what alt text is a photographic decision recorded in
// the curation sheet; how the page names itself in a list of search results is not.
//
// WHY these differ from the gallery's own <h1>: a genre gallery and its service dossier are
// two different intents on the same subject. /prestations/mariage answers "who can
// photograph my wedding" and is now titled for it; /galeries/mariages answers "show me the
// work". Titling both with the bare genre noun made two pages compete for one query and
// left Google to choose between them.
//
// SCOPE — the <title> only. The <h1> stays the plain genre noun ("Mariages"): on the page
// it sits under the "Galeries" chapter kicker, which supplies the context, and it is a
// designed editorial element. A <title> is read with no such context, so it has to say what
// it is showing. Changing one and not the other is the point, not an oversight.

import type { GenreSlug } from "@/types/gallery";

/** French is canonical; en.ts overrides where English usage differs (see the note there). */
export const galleryMeta: Record<GenreSlug, { metaTitle: string }> = {
  familles: { metaTitle: "Photos de famille" },
  grossesse: { metaTitle: "Photos de grossesse" },
  couples: { metaTitle: "Photos de couple" },
  mariages: { metaTitle: "Photos de mariage" },
};
