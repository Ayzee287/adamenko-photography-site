// The story schema — a category holds stories, a story holds photographs.
//
// This sits ALONGSIDE the genre model in `gallery.ts` rather than replacing it: a genre
// page is still a wall of frames when the genre has no stories, and becomes an index of
// stories when it has. Nothing about the existing galleries had to move to add this.
//
// Every field here is either DERIVED by scripts/stories-build.mjs from the photographs
// themselves, or EDITORIAL — written by a human in that story's story.txt. The two are
// never mixed by hand: the generated file is the published form of both.

import type { GenreSlug } from "./gallery";

/**
 * How much of the world may see this story.
 *
 * The default for a newly discovered folder is `draft`, never `portfolio` — being found
 * on disk is not consent to be published. Only `portfolio` reaches the public site, and
 * only after the build has confirmed it has a title and alt text on every frame.
 */
export type StoryVisibility = "private" | "draft" | "portfolio";

export type StoryImage = {
  /** Public path of the optimised export, e.g. "/stories/mariages/lucie-et-thomas/lucie-et-thomas-01.jpg". */
  src: string;
  /** TRUE output dimensions — the justified wall needs them to hang the frame uncropped. */
  width: number;
  height: number;
  /** Derived from the dimensions; never declared by a human. */
  orientation: "landscape" | "portrait" | "square";
  /** Editorial. Required (build-enforced) before a story may be `portfolio`. */
  alt: string;
  /** Editorial; falls back to `alt` when absent. */
  altEn: string;
};

export type Story = {
  /** `${category}/${slug}` — unique across the site. */
  id: string;
  category: GenreSlug;
  /** URL segment, shared across locales (the folder name). */
  slug: string;
  visibility: StoryVisibility;
  /** Editorial. `en` falls back to `fr` at generation time. */
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  /**
   * ISO date (YYYY-MM-DD). Derived from the earliest EXIF capture time unless a human
   * overrode it. May be empty — a missing date is a fact, not a gap to fill.
   */
  date: string;
  /**
   * Editorial and OPT-IN. Empty unless a human typed it, because a venue can identify a
   * private event. Never derived from GPS — the pipeline does not read GPS at all.
   */
  location: string;
  /** Public path of the cover frame (one of `images`). */
  cover: string;
  images: StoryImage[];
};
