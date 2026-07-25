// photos:sheets — contact sheets of the RAW photo library, for human review.
//
// The machine's only job here is organisation: it lays every frame out on numbered
// sheets with its filename, so a person can look at the whole take at once and decide
// what belongs in the edit. It makes NO selection and NO ordering decisions.
//
//   npm run photos:sheets            → sheets for the whole library
//   npm run photos:sheets -- --new   → only frames not already used in curation/collections.txt
//
// Output: curation/sheets/sheet-NN.jpg  +  curation/sheets/index.txt
//
// Workflow: review the sheets → write your picks into curation/collections.txt (in the
// order you want them hung) → `npm run photos:build`.

import sharp from "sharp";
import { readdirSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const SRC = process.env.PHOTO_LIBRARY || "c:/Users/Administrator/Documents/photos";
const OUT = path.resolve("curation/sheets");
const SHEET_FILE = path.resolve("curation/collections.txt");
const onlyNew = process.argv.includes("--new");

const COLS = 6;
const ROWS = 6;
const CELL_W = 320;
const CELL_H = 216;
const LABEL_H = 18;
const PAD = 8;

if (!existsSync(SRC)) {
  console.error(`photos:sheets — library not found: ${SRC}\nSet PHOTO_LIBRARY to override.`);
  process.exit(1);
}

// Frames already committed to the edit (so --new can show only what is still unseen).
const used = new Set();
if (existsSync(SHEET_FILE)) {
  for (const line of readFileSync(SHEET_FILE, "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:cover:\s*)?(IMG_[0-9A-Za-z_-]+)/.exec(line);
    if (m && !line.trim().startsWith("#")) used.add(m[1].toUpperCase());
  }
}

let files = readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();
if (onlyNew) {
  files = files.filter((f) => !used.has(path.parse(f).name.toUpperCase()));
}

if (files.length === 0) {
  console.log("photos:sheets — nothing to lay out.");
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
// Sheets are disposable output — clear stale ones so numbering never misleads.
for (const f of readdirSync(OUT).filter((f) => /^sheet-\d+\.jpg$/.test(f))) {
  rmSync(path.join(OUT, f));
}

const PER = COLS * ROWS;
const index = [];
let sheets = 0;

for (let start = 0; start < files.length; start += PER, sheets++) {
  const batch = files.slice(start, start + PER);
  const rows = Math.ceil(batch.length / COLS);
  const W = COLS * (CELL_W + PAD) + PAD;
  const H = rows * (CELL_H + LABEL_H + PAD) + PAD;
  const composites = [];

  for (let i = 0; i < batch.length; i++) {
    const f = batch[i];
    const x = PAD + (i % COLS) * (CELL_W + PAD);
    const y = PAD + Math.floor(i / COLS) * (CELL_H + LABEL_H + PAD);
    const name = path.parse(f).name;
    try {
      const buf = await sharp(path.join(SRC, f))
        .rotate()
        .resize(CELL_W, CELL_H, { fit: "contain", background: { r: 18, g: 16, b: 14 } })
        .toBuffer();
      composites.push({ input: buf, left: x, top: y });
      const mark = used.has(name.toUpperCase()) ? "•" : " ";
      const label = Buffer.from(
        `<svg width="${CELL_W}" height="${LABEL_H}"><text x="2" y="13" font-family="monospace" font-size="12" fill="#cfc7bb">${mark} ${name}</text></svg>`,
      );
      composites.push({ input: label, left: x, top: y + CELL_H });
      index.push(`sheet-${String(sheets).padStart(2, "0")}  ${name}${mark === "•" ? "  (in edit)" : ""}`);
    } catch (e) {
      console.warn(`  skip ${f}: ${e.message}`);
    }
  }

  const out = path.join(OUT, `sheet-${String(sheets).padStart(2, "0")}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: { r: 12, g: 11, b: 10 } } })
    .composite(composites)
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(out);
  console.log(`  ${path.relative(process.cwd(), out)}  (${batch.length} frames)`);
}

writeFileSync(
  path.join(OUT, "index.txt"),
  `${files.length} frames${onlyNew ? " (not yet in the edit)" : ""} · ${sheets} sheets\n` +
    `library: ${SRC}\n• = already used in curation/collections.txt\n\n${index.join("\n")}\n`,
  "utf8",
);

console.log(
  `\nphotos:sheets — ${files.length} frames across ${sheets} sheet(s) → curation/sheets/\n` +
    `Review them, then write your picks into curation/collections.txt and run: npm run photos:build`,
);
