// Content-contract validation — the gate that fails the build when the published data and
// the files on disk stop agreeing.
//
// This exists because the failure it catches is SILENT. Story exports are named
// `<slug>-NN.<hash8>.jpg`; before the hash was added, dropping a frame from the middle of a
// story renumbered every frame after it, and any hard-coded reference to `<slug>-NN.jpg`
// went on resolving — to a DIFFERENT photograph. Nothing 404'd, nothing failed to build,
// and the site kept publishing a photograph that had been withdrawn for consent reasons.
//
// The hash makes that break loudly instead of silently, and this is what turns "loudly"
// into a failed CI run rather than a surprise in production. Every check below is a rule
// that was broken at least once in this repository.
//
// Run: npm run validate:content

import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { orientationOf } from "./lib/photo-meta.mjs";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const imp = async (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const errors = [];
const fail = (area, msg) => errors.push(`${area}: ${msg}`);

const { stories } = await imp("src/content/stories.generated.ts");
const { blurMap } = await imp("src/lib/image-blur.ts");

// ── 1. every published frame exists, at the dimensions the model claims ──────────────
// The justified wall hangs frames from these numbers; a wrong one crops or mis-rows a
// photograph, and a missing file is a hole in the exhibition.
const published = new Set();
for (const s of stories) {
  for (const [i, img] of s.images.entries()) {
    published.add(img.src);
    const abs = path.join(PUBLIC, img.src);
    try {
      await stat(abs);
    } catch {
      fail("missing-file", `${s.id} frame ${i + 1}: ${img.src} is published but not on disk`);
      continue;
    }
    const m = await sharp(abs).metadata();
    if (m.width !== img.width || m.height !== img.height)
      fail("dimensions", `${img.src}: model says ${img.width}x${img.height}, file is ${m.width}x${m.height}`);
    if (orientationOf(m.width, m.height) !== img.orientation)
      fail("orientation", `${img.src}: model says ${img.orientation}, file is ${orientationOf(m.width, m.height)}`);
  }
}

// ── 2. covers belong to their own story ─────────────────────────────────────────────
for (const s of stories) {
  if (!s.images.some((i) => i.src === s.cover))
    fail("cover", `${s.id}: cover ${s.cover} is not one of its own frames`);
}

// ── 3. alt text still counts the story it is in ─────────────────────────────────────
// "Title — n / N" is generated, so a stale N means the model was hand-edited or a build
// was skipped. Both mean the published file no longer reflects the curation sheet.
for (const s of stories) {
  const n = s.images.length;
  for (const [i, img] of s.images.entries()) {
    for (const [field, value, title] of [["alt", img.alt, s.title.fr], ["altEn", img.altEn, s.title.en]]) {
      const m = /^(.*) — (\d+) \/ (\d+)$/.exec(value);
      if (!m) { fail("alt", `${s.id} frame ${i + 1}: ${field} is not "Title — n / N" ("${value}")`); continue; }
      if (m[1] !== title) fail("alt", `${s.id} frame ${i + 1}: ${field} titled "${m[1]}", story is "${title}"`);
      if (Number(m[2]) !== i + 1) fail("alt", `${s.id} frame ${i + 1}: ${field} numbers it ${m[2]}`);
      if (Number(m[3]) !== n) fail("alt", `${s.id} frame ${i + 1}: ${field} totals ${m[3]}, story has ${n}`);
    }
  }
}

// ── 4. no stale exports left on disk ────────────────────────────────────────────────
// An export that no story references is a photograph still reachable by URL after being
// cut. That is the consent problem, not a housekeeping one.
async function walk(dir) {
  const out = [];
  let es;
  try { es = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of es) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.jpe?g$/i.test(e.name)) out.push("/" + path.relative(PUBLIC, p).split(path.sep).join("/"));
  }
  return out;
}
for (const f of await walk(path.join(PUBLIC, "stories")))
  if (!published.has(f)) fail("orphan", `${f} is on disk but no story publishes it`);

// ── 5. a private story has no exports in the public web root ────────────────────────
// A route gate hides a page, not a JPEG.
for (const s of stories) {
  if (s.visibility !== "portfolio")
    fail("visibility", `${s.id}: visibility "${s.visibility}" reached the published model`);
}
for (const cat of await readdir(path.join(PUBLIC, "stories")).catch(() => [])) {
  for (const slug of await readdir(path.join(PUBLIC, "stories", cat)).catch(() => [])) {
    if (!stories.some((s) => s.category === cat && s.slug === slug))
      fail("visibility", `public/stories/${cat}/${slug}/ has exports but publishes no story`);
  }
}

// ── 6. every hand-written reference to a story frame still resolves ─────────────────
// This is the check the whole file exists for. These paths are typed by a human on a
// curated surface (homepage tiles, /galeries plates, dossier heroes) and are the ones that
// used to change meaning under a re-cut.
const SOURCES = [
  "src/content/home.ts",
  "src/content/gallery-covers.ts",
  "src/content/service-dossier.ts",
  "src/content/dictionaries/en.ts",
  "scripts/gen-blur.mjs",
];
for (const rel of SOURCES) {
  const text = await readFile(path.join(ROOT, rel), "utf8").catch(() => null);
  if (text === null) { fail("source", `${rel} not found`); continue; }
  for (const m of text.matchAll(/\/?stories\/[A-Za-z0-9/_-]+\.[A-Za-z0-9]+\.jpe?g/g)) {
    const src = "/" + m[0].replace(/^\//, "");
    if (!published.has(src))
      fail("stale-reference", `${rel} points at ${src}, which no story publishes`);
  }
}

// ── 7. curated surfaces blur up ─────────────────────────────────────────────────────
// next/image drops the placeholder silently when a key is missing, so a frame promoted
// onto a curated surface without a placeholder pops in beside plates that do not.
for (const s of stories)
  if (!blurMap[s.cover]) fail("blur", `${s.id}: cover ${s.cover} has no blur placeholder`);
for (const key of Object.keys(blurMap)) {
  try {
    await stat(path.join(PUBLIC, key));
  } catch {
    fail("blur", `blurMap key ${key} has no file on disk`);
  }
}

// ── report ──────────────────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`\n[validate:content] ${errors.length} problem(s):\n`);
  for (const e of errors) console.error("  · " + e);
  console.error("");
  process.exit(1);
}
console.log(
  `[validate:content] OK — ${stories.length} stories, ${published.size} frames, ` +
    `${Object.keys(blurMap).length} placeholders; dimensions, covers, alt counters, ` +
    `orphans, visibility and hand-written frame references all check out.`,
);
