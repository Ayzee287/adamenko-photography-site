// stories:build — turn folders of chosen photographs into published stories.
//
//   <STORY_LIBRARY>/<category>/<slug>/*.jpg   +   story.txt (the human's edit)
//        →  public/stories/<category>/<slug>/<slug>-NN.jpg   (optimised, metadata-free)
//        →  src/content/stories.generated.ts                 (the typed model)
//
// The division of labour is the same one D094 set for the galleries: the machine
// organises, validates and optimises; the human decides what is good enough, what it
// sits next to, and when it goes public.
//
//   npm run stories:check     validate + report, write nothing
//   npm run stories:build     validate, optimise what changed, regenerate the model
//
// Guarantees this script is expected to hold, and which tests assert:
//   · it never writes into the source library beyond story.txt, and never deletes a source photo;
//   · it never rewrites a human's editorial line (story-sheet.mjs owns that contract);
//   · a story is `draft` until a human says `portfolio` — discovery never publishes;
//   · re-running with nothing changed re-encodes nothing and rewrites no file.

import sharp from "sharp";
import {
  readdirSync, existsSync, mkdirSync, statSync, writeFileSync, readFileSync, rmSync,
} from "node:fs";
import path from "node:path";
import { readPhoto, readCaptureTime, orientationOf } from "./lib/photo-meta.mjs";
import { parseStorySheet, syncStorySheet } from "./lib/story-sheet.mjs";

const SRC = process.env.STORY_LIBRARY || "c:/Users/Administrator/Documents/photos-stories";

// Two roots, and the split is a privacy boundary rather than a convenience.
//
// `public/stories/` is the deployable web root: anything written there is a static asset
// on the live domain, reachable by URL whether or not a page links to it. So ONLY
// `portfolio` stories are written there. A draft's photographs go to `public/stories-draft/`,
// which is gitignored — visible to `next dev` for review, impossible to commit or deploy.
// (Excluding drafts from the ROUTES was never enough on its own: the route gate hides the
// page, not the JPEG.)
const PUB = path.resolve("public/stories");
const PUB_DRAFT = path.resolve("public/stories-draft");
const rootFor = (visibility) => (visibility === "portfolio" ? PUB : PUB_DRAFT);
const MODEL = path.resolve("src/content/stories.generated.ts");
const STATE = path.resolve(".story-ingest-state.json");
const LONG_EDGE = 2200; // matches the galleries' web master
const QUALITY = 82;

const checkOnly = process.argv.includes("--check");
const CATEGORIES = ["familles", "grossesse", "couples", "mariages"];
const IMAGE_RE = /\.(jpe?g|png)$/i;

const problems = [];
const notes = [];
const say = (s) => console.log(s);

// ── discovery ────────────────────────────────────────────────────────────────────
// A folder is a story. Nothing is inferred beyond that: the category is the parent
// directory (and must be a known one), the slug is the folder name.
function discover() {
  if (!existsSync(SRC)) {
    say(`stories — no library at ${SRC}`);
    say(`  set STORY_LIBRARY, or create <library>/<category>/<story>/ and drop photographs in.`);
    return [];
  }
  const found = [];
  for (const category of readdirSync(SRC)) {
    const catDir = path.join(SRC, category);
    if (!statSync(catDir).isDirectory() || category.startsWith(".")) continue;
    if (!CATEGORIES.includes(category)) {
      problems.push(`"${category}/" is not a known category (expected: ${CATEGORIES.join(", ")})`);
      continue;
    }
    for (const slug of readdirSync(catDir)) {
      const dir = path.join(catDir, slug);
      if (!statSync(dir).isDirectory() || slug.startsWith(".")) continue;
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        problems.push(`${category}/${slug}: folder name must be a url-safe slug (lowercase, digits, hyphens)`);
        continue;
      }
      const files = readdirSync(dir).filter((f) => IMAGE_RE.test(f)).sort();
      found.push({ category, slug, dir, files });
    }
  }
  return found;
}

// Order a folder's frames by when the shutter fired, falling back to filename for anything
// without a readable capture time (those sort last, so an undated frame never silently
// jumps to the front of a shoot).
async function chronological(dir, files) {
  const stamped = [];
  for (const f of files) stamped.push({ f, t: await readCaptureTime(path.join(dir, f)) });
  stamped.sort((a, b) => {
    if (a.t && b.t) return a.t.localeCompare(b.t) || a.f.localeCompare(b.f);
    if (a.t) return -1;
    if (b.t) return 1;
    return a.f.localeCompare(b.f);
  });
  return stamped.map((s) => s.f);
}

// ── per-story read ───────────────────────────────────────────────────────────────
async function readStory(story) {
  const sheetPath = path.join(story.dir, "story.txt");

  if (story.files.length === 0) {
    problems.push(`${story.category}/${story.slug}: no photographs in the folder`);
    return null;
  }

  // Create or top up the human's sheet. This is the ONE write into the source library.
  //
  // A NEW sheet is written in CAPTURE-TIME order, not filename order. Camera filenames
  // (096A1687.jpg) usually happen to sort chronologically, but any frame renamed by hand
  // sorts to an arbitrary place and lands somewhere it was never shot. Chronological is the
  // one order that is both deterministic and meaningful — a shoot walks forwards — and it is
  // a STARTING order, not a claim about the edit: the sheet is the human's to re-order.
  if (!checkOnly) {
    const ordered = await chronological(story.dir, story.files);
    const { created, appended } = syncStorySheet(sheetPath, story.category, story.slug, ordered);
    if (created) notes.push(`${story.category}/${story.slug}: created story.txt (${story.files.length} frames) — add a title and alt text`);
    else if (appended.length) notes.push(`${story.category}/${story.slug}: appended ${appended.length} new frame(s) to story.txt`);
  } else if (!existsSync(sheetPath)) {
    notes.push(`${story.category}/${story.slug}: no story.txt yet (stories:build would create one)`);
    return null;
  }

  const sheet = parseStorySheet(readFileSync(sheetPath, "utf8"));
  for (const p of sheet.problems) problems.push(`${story.category}/${story.slug}: ${p}`);

  // The sheet is the order. Frames on disk but not in the sheet were deliberately
  // dropped by a human (commented or deleted) — that is an edit, not an error.
  const onDisk = new Set(story.files);
  const photos = [];
  const seen = new Set();
  for (const p of sheet.photos) {
    if (!onDisk.has(p.file)) {
      problems.push(`${story.category}/${story.slug}: story.txt lists "${p.file}" but it is not in the folder`);
      continue;
    }
    if (seen.has(p.file)) {
      problems.push(`${story.category}/${story.slug}: "${p.file}" is listed twice`);
      continue;
    }
    seen.add(p.file);
    photos.push(p);
  }

  // ── derived facts + integrity ──
  const byHash = new Map();
  const resolved = [];
  for (const p of photos) {
    const abs = path.join(story.dir, p.file);
    const meta = await readPhoto(abs);
    if (!meta.ok) {
      problems.push(`${story.category}/${story.slug}: "${p.file}" is unreadable — ${meta.error}`);
      continue;
    }
    if (byHash.has(meta.hash)) {
      // A BYTE-IDENTICAL file is an accidental copy ("photo (1).jpg"), never a selection —
      // nobody chooses to hang the same bytes twice. Excluding it is de-duplication, not an
      // editorial decision, so it is reported loudly and skipped rather than failing the
      // whole build. (Listing a DIFFERENT photograph twice in the sheet is still an error:
      // that one is ambiguous, and only a human can say which position was meant.)
      notes.push(
        `${story.category}/${story.slug}: skipped "${p.file}" — byte-identical to ` +
          `"${byHash.get(meta.hash)}" (duplicate file, kept once)`,
      );
      continue;
    }
    byHash.set(meta.hash, p.file);
    resolved.push({ ...p, abs, ...meta, orientation: orientationOf(meta.width, meta.height) });
  }

  if (resolved.length === 0) {
    problems.push(`${story.category}/${story.slug}: no usable photographs`);
    return null;
  }

  // date: explicit override, else the earliest capture time we could read.
  const captures = resolved.map((r) => r.capturedAt).filter(Boolean).sort();
  const date = sheet.date || (captures[0] ? captures[0].slice(0, 10) : "");

  // cover: explicit, else the opening frame.
  let coverFile = sheet.cover || resolved[0].file;
  if (!resolved.some((r) => r.file === coverFile)) {
    problems.push(`${story.category}/${story.slug}: cover "${coverFile}" is not one of the story's photographs`);
    coverFile = resolved[0].file;
  }

  // Publishing gate — only enforced for stories asking to be public.
  if (sheet.visibility === "portfolio") {
    if (!sheet.title.trim()) problems.push(`${story.category}/${story.slug}: visibility is "portfolio" but title: is empty`);
    const missingAlt = resolved.filter((r) => !r.alt.trim());
    if (missingAlt.length) {
      problems.push(
        `${story.category}/${story.slug}: visibility is "portfolio" but ${missingAlt.length} frame(s) have no alt text ` +
          `(${missingAlt.slice(0, 3).map((m) => m.file).join(", ")}${missingAlt.length > 3 ? ", …" : ""})`,
      );
    }
  }

  return { ...story, ...sheet, date, coverFile, photos: resolved };
}

// ── optimise ─────────────────────────────────────────────────────────────────────
// Idempotency: the published file is keyed to the SOURCE hash, so an unchanged photo
// is never re-encoded and an edited one always is.
//
// Exports are named `<slug>-NN.<hash8>.jpg`, where NN is the position in the hang and
// hash8 is the first 8 hex of the source's content hash.
//
// The hash is not decoration, and NN alone was actively unsafe. Names used to be
// position-only, so removing a frame from the middle of a story renumbered every frame
// after it and a URL kept pointing at a DIFFERENT photograph. Combined with
// `minimumCacheTTL` (31 days, next.config.ts), that meant a withdrawn photograph went on
// being served from the image-optimisation cache and from visitors' browsers at its old,
// recycled URL — verified on 2026-08-01 and again on 2026-08-02, when the maternity frame
// dropped for consent reasons was still being shown by the deployed preview.
//
// Frames get dropped here for consent and decency. A URL must therefore denote ONE
// photograph for all time: with the hash in the name, changing the picture changes the
// URL, the old URL simply stops existing, and no cache anywhere can keep publishing a
// photograph that was withdrawn. NN is kept so the folder still reads in hang order.
//
// The cost is that a hard-coded frame reference (home.ts, gallery-covers.ts,
// service-dossier.ts, dictionaries/en.ts, gen-blur's ALWAYS_INCLUDE) now breaks LOUDLY
// when its frame changes, instead of silently resolving to a different photograph.
// `npm run validate:content` is what turns that into a failed build rather than a
// surprise in production.
const loadState = () => {
  try { return JSON.parse(readFileSync(STATE, "utf8")); } catch { return {}; }
};

async function publishPhotos(story, state, nextState) {
  const root = rootFor(story.visibility);
  const outDir = path.join(root, story.category, story.slug);
  mkdirSync(outDir, { recursive: true });
  const keep = new Set();
  const out = [];
  let encoded = 0;

  for (let i = 0; i < story.photos.length; i++) {
    const p = story.photos[i];
    const name = `${story.slug}-${String(i + 1).padStart(2, "0")}.${p.hash.slice(0, 8)}.jpg`;
    const abs = path.join(outDir, name);
    // The state key carries the root, so promoting a story from draft to portfolio
    // re-encodes into the public root instead of trusting the draft's cached entry.
    const key = `${story.visibility === "portfolio" ? "pub" : "draft"}:${story.category}/${story.slug}/${name}`;
    keep.add(name);

    let dims = state[key]?.hash === p.hash && existsSync(abs) ? state[key] : null;
    if (!dims) {
      const info = await sharp(p.abs)
        .rotate()
        .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
        .toFile(abs);
      // sharp drops EXIF/ICC/XMP on re-encode — this is where GPS stops existing.
      dims = { hash: p.hash, width: info.width, height: info.height };
      encoded++;
    }
    nextState[key] = dims;
    const urlRoot = story.visibility === "portfolio" ? "stories" : "stories-draft";
    out.push({
      src: `/${urlRoot}/${story.category}/${story.slug}/${name}`,
      width: dims.width,
      height: dims.height,
      orientation: orientationOf(dims.width, dims.height),
      alt: p.alt,
      altEn: p.altEn,
      file: p.file,
    });
  }

  // Drop exports from a previous, longer edit — outputs only, never sources.
  for (const f of readdirSync(outDir)) {
    if (/\.jpe?g$/i.test(f) && !keep.has(f)) {
      rmSync(path.join(outDir, f));
      notes.push(`${story.category}/${story.slug}: removed stale export ${f}`);
    }
  }

  // A story that moved between draft and portfolio leaves a copy behind in the other
  // root. Left there, a demoted story would keep serving its photographs from the public
  // web root long after someone decided it should not be public.
  const otherRoot = story.visibility === "portfolio" ? PUB_DRAFT : PUB;
  const stale = path.join(otherRoot, story.category, story.slug);
  if (existsSync(stale)) {
    rmSync(stale, { recursive: true, force: true });
    notes.push(
      `${story.category}/${story.slug}: visibility changed — removed its exports from ` +
        `${otherRoot === PUB ? "public/stories" : "public/stories-draft"}`,
    );
  }
  return { images: out, encoded };
}

// ── generate ─────────────────────────────────────────────────────────────────────
const q = (s) => JSON.stringify(s ?? "");

function generateModel(stories) {
  const body = stories
    .map((s) => {
      const cover = s.images.find((im) => im.file === s.coverFile) ?? s.images[0];
      const imgs = s.images
        .map(
          (im) =>
            `      { src: ${q(im.src)}, width: ${im.width}, height: ${im.height}, ` +
            `orientation: ${q(im.orientation)}, alt: ${q(im.alt)}, altEn: ${q(im.altEn)} },`,
        )
        .join("\n");
      return `  {
    id: ${q(`${s.category}/${s.slug}`)},
    category: ${q(s.category)},
    slug: ${q(s.slug)},
    visibility: ${q(s.visibility)},
    title: { fr: ${q(s.title)}, en: ${q(s.titleEn || s.title)} },
    description: { fr: ${q(s.description)}, en: ${q(s.descriptionEn || s.description)} },
    date: ${q(s.date)},
    location: ${q(s.location)},
    cover: ${q(cover.src)},
    images: [
${imgs}
    ],
  },`;
    })
    .join("\n");

  return `import type { Story } from "@/types/story";

// AUTO-GENERATED by scripts/stories-build.mjs — do not hand-edit.
// The EDIT (which photographs, in which order, with what alt text, and whether the story
// is public at all) is a human decision recorded in each story's story.txt; this file is
// only its published form. Sources are the photographer's own exports: auto-rotated,
// stripped of EXIF/ICC/XMP by the re-encode, resized and mozjpeg-optimised. Widths and
// heights are TRUE output dimensions, so the exhibition hangs every frame uncropped.
// Regenerate: npm run stories:build

export const stories: Story[] = [
${body}
];
`;
}

// ── run ──────────────────────────────────────────────────────────────────────────
const found = discover();
if (found.length === 0 && problems.length === 0) {
  say("stories — no story folders found; nothing to do.");
}

const read = [];
for (const s of found) {
  const r = await readStory(s);
  if (r) read.push(r);
}

// Publishable = anything a human has moved off `private`. Drafts are built locally so
// they can be looked at, but the site is responsible for not routing them (types/story).
const buildable = read.filter((s) => s.visibility !== "private");
const skippedPrivate = read.length - buildable.length;

if (problems.length) {
  console.error(`\nstories — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error("  · " + p);
}
for (const n of notes) say("  · " + n);

say(
  `\nstories — ${read.length} story/stories (` +
    `${read.filter((s) => s.visibility === "portfolio").length} portfolio, ` +
    `${read.filter((s) => s.visibility === "draft").length} draft, ` +
    `${skippedPrivate} private)`,
);
for (const s of read) {
  say(`  ${s.category}/${s.slug}: ${s.photos.length} frames · ${s.visibility}${s.date ? " · " + s.date : ""}`);
}

if (checkOnly) {
  say("\n--check: nothing written.");
  process.exit(problems.length ? 1 : 0);
}
// A problem must not silently publish a half-built story.
if (problems.length) process.exit(1);

const state = loadState();
const nextState = {};
let totalEncoded = 0;
const published = [];
for (const s of buildable) {
  const { images, encoded } = await publishPhotos(s, state, nextState);
  totalEncoded += encoded;
  published.push({ ...s, images });
}

mkdirSync(PUB, { recursive: true });
writeFileSync(STATE, JSON.stringify(nextState, null, 0), "utf8");

const model = generateModel(published);
const prior = existsSync(MODEL) ? readFileSync(MODEL, "utf8") : "";
const modelChanged = prior !== model;
if (modelChanged) writeFileSync(MODEL, model, "utf8");

say(
  `\nstories:build — ${totalEncoded === 0 ? "nothing to re-encode" : totalEncoded + " frame(s) encoded"}; ` +
    `model ${modelChanged ? "regenerated" : "unchanged"}.`,
);
if (published.some((s) => s.visibility === "portfolio")) {
  say("  next: npm run gen:blur   (blur-up placeholders for the new frames)");
}
