// Regenerates src/lib/image-blur.ts — the tiny blur-up placeholders next/image
// uses so a photograph resolves from a soft preview of itself rather than a flash
// (restores the workflow the map's header promises — B4).
//
// Run after adding or replacing any photograph under public/:
//
//   npm run gen:blur
//
// It scans public/ for JPEGs and emits one 12px-wide proportional JPEG data URI
// per file (the format of the existing map — small enough to inline, soft enough
// that next/image's blur filter reads as a preview, not pixels). The output file
// is fully regenerated and deterministic (keys sorted); never hand-edit it.

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(ROOT, "src", "lib", "image-blur.ts");

// Story frames are deliberately EXCLUDED from the blur map.
//
// This map is imported by the lightbox, which is a client component, so every entry ships
// in the JS bundle. Measured with the real portfolio: including the ~890 story frames took
// image-blur.ts from 25 KB to 538 KB of inline base64 — half a megabyte of client JavaScript
// to soften the arrival of images that are lazy-loaded anyway, inside an Exhibition that
// already reserves each frame's exact box (CLS 0) and reveals it out of the dark.
//
// The curated surfaces that DO get a placeholder are the ones a visitor meets immediately:
// gallery covers, the homepage, the about portrait. next/image simply omits the placeholder
// when a key is missing, so exclusion degrades gracefully.
const EXCLUDED = /^(stories|stories-draft)\//;

// …with a narrow exception for individual story frames promoted onto a CURATED surface.
// The homepage genre tiles are above the fold and the other three already blur up; leaving
// the Mariages tile as the only one that pops in would be a visible inconsistency. One entry
// costs a few hundred bytes, which is not the 890-frame problem the exclusion exists to stop.
// Add a path here only when a story frame is used outside the story pages themselves.
const ALWAYS_INCLUDE = new Set([
  "stories/mariages/mariages-3/mariages-3-19.bed0ddcd.jpg",
  // The Couples and Grossesse tiles moved to real session frames (a wedding photograph was
  // standing in for the couple séance; the maternity frame was the /galeries cover twice
  // over). Same reasoning as above — they are homepage tiles, so they must blur up too.
  "stories/couples/couples-2/couples-2-12.ea75fa70.jpg",
  "stories/grossesse/grossesse-1/grossesse-1-14.f1a5acf5.jpg",
  // The Familles plate on /galeries — see content/gallery-covers.ts. Same rule as the
  // Mariages plate below: it is the lead print on that wall, so it has to blur up.
  "stories/familles/familles-3/familles-3-32.512c4df9.jpg",
  // The Grossesse dossier hero — a landscape frame, because the cinematic band cropped
  // the bump out of the portrait cover it used to show.
  "stories/grossesse/grossesse-2/grossesse-2-03.3fc28625.jpg",
  // The Mariages plate on /galeries — the lead print on that wall, and the largest
  // photograph on the page. See content/gallery-covers.ts for why it is not the cover.
  "stories/mariages/mariages-4/mariages-4-37.56163dbb.jpg",
]);

// Every published story's COVER, derived rather than hand-listed.
//
// A cover is not a story frame in the sense the exclusion above is about: it is the plate
// a visitor meets on /galeries/<genre> and on the service dossiers, and on a genre page
// the newest story's cover is the full-width lead — the largest photograph on the page and
// its LCP element. Those were the only images on the site arriving with no placeholder,
// so they popped in while the plates beside them blurred up.
//
// Derived, because hand-listing is what let them drift out in the first place: covers are
// re-chosen during an edit, and a list maintained by hand records the cover that was
// current when someone last remembered to update it. 16 covers ≈ 9 KB — the exclusion
// exists to stop 890 frames / 538 KB, not this.
for (const s of (await import(pathToFileURL(path.join(ROOT, "src/content/stories.generated.ts")).href)).stories) {
  ALWAYS_INCLUDE.add(s.cover.replace(/^\//, ""));
}

/** All JPEG files under `dir`, recursively, minus the excluded roots. */
async function collectJpegs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    const rel = path.relative(PUBLIC_DIR, p).split(path.sep).join("/");
    if (EXCLUDED.test(rel) && !ALWAYS_INCLUDE.has(rel)) {
      // still descend into an excluded directory when it contains an allowlisted frame
      if (!entry.isDirectory()) continue;
      const prefix = rel + "/";
      if (![...ALWAYS_INCLUDE].some((a) => a.startsWith(prefix))) continue;
    }
    if (entry.isDirectory()) out.push(...(await collectJpegs(p)));
    else if (/\.jpe?g$/i.test(entry.name)) out.push(p);
  }
  return out;
}

const files = (await collectJpegs(PUBLIC_DIR)).sort();
if (files.length === 0) {
  console.error("gen-blur: no JPEGs found under public/ — nothing to do.");
  process.exit(1);
}

const entries = [];
for (const file of files) {
  const buf = await sharp(file).resize({ width: 12 }).jpeg({ quality: 70 }).toBuffer();
  const key = "/" + path.relative(PUBLIC_DIR, file).split(path.sep).join("/");
  entries.push(`  "${key}":\n    "data:image/jpeg;base64,${buf.toString("base64")}",`);
}

const banner = `// AUTO-GENERATED by scripts/gen-blur.mjs (\`npm run gen:blur\`) — tiny base64
// blur-up placeholders, keyed by the image's public path. Used by ImageFigure +
// hero + discover to render next/image \`placeholder="blur"\` so a photograph
// resolves from a soft preview of itself rather than a flash. Regenerate after
// adding/replacing images. Do not hand-edit.

export const blurMap: Record<string, string> = {
${entries.join("\n")}
};

/** blurDataURL for a public image path, or undefined if none was generated. */
export function blurFor(src?: string): string | undefined {
  return src ? blurMap[src] : undefined;
}
`;

await writeFile(OUT_FILE, banner);
console.log(`gen-blur: wrote ${files.length} placeholders → ${path.relative(ROOT, OUT_FILE)}`);
