// photos:build — publish the human edit to the website.
//
// Reads curation/collections.txt (the edit: which frames, in which order, with what alt
// text), optimises exactly those frames out of the raw library, and regenerates BOTH
// locale surfaces from that single source:
//
//   public/galleries/<slug>/<slug>-aNN.jpg   (a00 = cover, a01.. = hang order)
//   src/content/galleries.ts                 (FR — the typed gallery model)
//   src/content/galleries.en.ts              (EN overlay — titles/intros/alts)
//
// The machine never chooses or re-orders a photograph. It validates, optimises and wires.
// Images are auto-rotated, EXIF-stripped (sharp drops metadata by default), resized to a
// web master and mozjpeg-encoded. Stale outputs from earlier edits are removed.
//
//   npm run photos:build
//   npm run photos:build -- --check   (validate only; touch nothing)

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const SRC = process.env.PHOTO_LIBRARY || "c:/Users/Administrator/Documents/photos";
const SHEET = path.resolve("curation/collections.txt");
const PUB = path.resolve("public/galleries");
const LONG_EDGE = 2200; // web master; next/image derives the responsive set from this
const QUALITY = 82;
const checkOnly = process.argv.includes("--check");

const ORDER = ["familles", "grossesse", "couples", "mariages"];

// ── parse ─────────────────────────────────────────────────────────────────────────
if (!existsSync(SHEET)) {
  console.error(`photos:build — no curation sheet at ${SHEET}`);
  process.exit(1);
}
const lines = readFileSync(SHEET, "utf8").split(/\r?\n/);
const collections = new Map();
let cur = null;
const errors = [];

const splitAlt = (rest) => {
  const parts = rest.split("|").map((s) => s.trim());
  return { file: parts[0], alt: parts[1] || "", altEn: parts[2] || "" };
};

lines.forEach((raw, n) => {
  const line = raw.trim();
  if (!line || line.startsWith("#")) return;
  const ln = n + 1;

  const sec = /^\[([a-z0-9-]+)\]$/.exec(line);
  if (sec) {
    cur = { slug: sec[1], title: "", titleEn: "", intro: "", introEn: "", cover: null, photos: [] };
    collections.set(cur.slug, cur);
    return;
  }
  if (!cur) {
    errors.push(`line ${ln}: content before any [collection]`);
    return;
  }

  const kv = /^(title|title\.en|intro|intro\.en|cover):\s*(.*)$/.exec(line);
  if (kv) {
    const [, key, val] = kv;
    if (key === "title") cur.title = val;
    else if (key === "title.en") cur.titleEn = val;
    else if (key === "intro") cur.intro = val;
    else if (key === "intro.en") cur.introEn = val;
    else if (key === "cover") {
      const c = splitAlt(val);
      if (!c.file) errors.push(`line ${ln}: cover has no file`);
      if (!c.alt) errors.push(`line ${ln}: cover "${c.file}" has no alt text`);
      cur.cover = c;
    }
    return;
  }

  // a photo line: FILE | fr alt | en alt
  const p = splitAlt(line);
  if (!/^IMG_[0-9A-Za-z_-]+$/i.test(p.file)) {
    errors.push(`line ${ln}: not a recognised photo line → "${line.slice(0, 60)}"`);
    return;
  }
  if (!p.alt) errors.push(`line ${ln}: "${p.file}" has no alt text (required)`);
  cur.photos.push(p);
});

// ── validate ──────────────────────────────────────────────────────────────────────
const resolveSource = (name) => {
  for (const ext of [".JPG", ".jpg", ".jpeg", ".JPEG", ".png", ".PNG"]) {
    const f = path.join(SRC, name + ext);
    if (existsSync(f)) return f;
  }
  return null;
};

for (const [slug, c] of collections) {
  if (!ORDER.includes(slug)) errors.push(`[${slug}]: unknown collection (expected one of ${ORDER.join(", ")})`);
  if (!c.title) errors.push(`[${slug}]: missing title:`);
  if (!c.cover) errors.push(`[${slug}]: missing cover:`);
  if (c.photos.length === 0) errors.push(`[${slug}]: no photographs`);
  const seen = new Set();
  for (const p of [c.cover, ...c.photos].filter(Boolean)) {
    if (!resolveSource(p.file)) errors.push(`[${slug}]: "${p.file}" not found in ${SRC}`);
    if (seen.has(p.file)) errors.push(`[${slug}]: "${p.file}" appears twice in this collection`);
    seen.add(p.file);
  }
}
for (const slug of ORDER) if (!collections.has(slug)) errors.push(`missing collection [${slug}]`);

if (errors.length) {
  console.error(`photos:build — ${errors.length} problem(s) in curation/collections.txt:\n`);
  for (const e of errors) console.error("  · " + e);
  process.exit(1);
}
console.log(
  `curation sheet OK — ${collections.size} collections, ` +
    `${[...collections.values()].reduce((n, c) => n + c.photos.length + 1, 0)} frames.`,
);
if (checkOnly) {
  console.log("--check: nothing written.");
  process.exit(0);
}

// ── optimise ──────────────────────────────────────────────────────────────────────
const emit = async (slug, file, outName) => {
  const dir = path.join(PUB, slug);
  mkdirSync(dir, { recursive: true });
  const abs = path.join(dir, `${outName}.jpg`);
  const info = await sharp(resolveSource(file))
    .rotate()
    .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toFile(abs);
  return { src: `/galleries/${slug}/${outName}.jpg`, width: info.width, height: info.height };
};

const built = {};
for (const slug of ORDER) {
  const c = collections.get(slug);
  const keep = new Set();
  const cover = { ...(await emit(slug, c.cover.file, `${slug}-a00`)), alt: c.cover.alt, altEn: c.cover.altEn };
  keep.add(`${slug}-a00.jpg`);
  const images = [];
  for (let i = 0; i < c.photos.length; i++) {
    const name = `${slug}-a${String(i + 1).padStart(2, "0")}`;
    images.push({ ...(await emit(slug, c.photos[i].file, name)), alt: c.photos[i].alt, altEn: c.photos[i].altEn });
    keep.add(`${name}.jpg`);
  }
  // drop outputs from a previous, longer edit
  for (const f of readdirSync(path.join(PUB, slug))) {
    if (/\.jpe?g$/i.test(f) && !keep.has(f)) {
      rmSync(path.join(PUB, slug, f));
      console.log(`  removed stale ${slug}/${f}`);
    }
  }
  built[slug] = { ...c, cover, images };
  console.log(`  ${slug}: cover + ${images.length} frames`);
}

// ── generate ──────────────────────────────────────────────────────────────────────
const q = (s) => JSON.stringify(s);
const ratioToken = (w, h) => (w / h >= 1.15 ? "aspect-[3/2]" : w / h <= 0.87 ? "aspect-[2/3]" : "aspect-square");
const imgLit = (o, ind) =>
  `${ind}{ src: "${o.src}", width: ${o.width}, height: ${o.height}, ratio: "${ratioToken(o.width, o.height)}", alt: ${q(o.alt)} },`;

let body = "";
for (const slug of ORDER) {
  const g = built[slug];
  body += `  {\n    slug: "${slug}",\n    title: ${q(g.title)},\n    intro: ${q(g.intro)},\n`;
  body += `    cover: {\n      src: "${g.cover.src}",\n      width: ${g.cover.width}, height: ${g.cover.height}, ratio: "${ratioToken(g.cover.width, g.cover.height)}",\n      alt: ${q(g.cover.alt)},\n    },\n    images: [\n`;
  body += g.images.map((o) => imgLit(o, "      ")).join("\n") + "\n    ],\n  },\n";
}

const feat = [built.mariages.cover, built.familles.images[6], built.grossesse.cover, built.couples.images[6], built.mariages.images[6]].filter(Boolean);

writeFileSync(
  path.resolve("src/content/galleries.ts"),
  `import type { Gallery, GalleryImage, GenreSlug } from "@/types/gallery";

// AUTO-GENERATED by scripts/photos-build.mjs from curation/collections.txt — do not hand-edit.
// The EDIT (which frames, in which order, with what alt text) is a human decision recorded in
// that curation sheet; this file is only its published form. Sources are the photographer's own
// high-resolution library: auto-rotated, EXIF-stripped, resized and mozjpeg-optimised. Widths and
// heights are the TRUE output dimensions, so the exhibition hangs every frame uncropped.
// Regenerate: npm run photos:build

export const galleries: Gallery[] = [
${body}];

/** Cross-genre pull (kept for the localisation type contract). */
export const featured: GalleryImage[] = [
${feat.map((o) => imgLit(o, "  ")).join("\n")}
];

/** Ordered slugs for nav / static params. */
export const genreSlugs = galleries.map((g) => g.slug) as GenreSlug[];
`,
  "utf8",
);

let en = `import type { GenreSlug } from "@/types/gallery";

// AUTO-GENERATED by scripts/photos-build.mjs from curation/collections.txt — do not hand-edit.
// The English overlay for the galleries. Generated from the SAME curation sheet as the French
// model, so the two locales can never drift out of sync (they did, twice, when maintained by
// hand). A missing EN string falls back to the French one at build time.
// Regenerate: npm run photos:build

export const galleryText: Record<
  GenreSlug,
  { title: string; intro: string; coverAlt: string; alts: string[] }
> = {
`;
for (const slug of ORDER) {
  const g = built[slug];
  en += `  ${slug}: {\n    title: ${q(g.titleEn || g.title)},\n    intro: ${q(g.introEn || g.intro)},\n    coverAlt: ${q(g.cover.altEn || g.cover.alt)},\n    alts: [\n`;
  en += g.images.map((o) => `      ${q(o.altEn || o.alt)},`).join("\n") + "\n    ],\n  },\n";
}
en += `};

/** Cross-genre pull, aligned with \`featured\` in galleries.ts. */
export const featuredAlts: string[] = [
${feat.map((o) => `  ${q(o.altEn || o.alt)},`).join("\n")}
];
`;
writeFileSync(path.resolve("src/content/galleries.en.ts"), en, "utf8");

console.log(
  `\nphotos:build — published.\n` +
    `  src/content/galleries.ts + galleries.en.ts regenerated\n` +
    `  next: npm run gen:blur   (blur-up placeholders for the new frames)`,
);
