// delivery:prepare — stage a shoot for Pixieset client delivery.
//
// WHY THIS IS A FOLDER AND NOT AN API CALL
// Pixieset publishes no API. Their entire official integration surface (verified against
// pixieset.com/apps and the Pixieset help centre, 2026-07-26) is: the Lightroom Classic
// publish plug-in, the Studio Manager mobile app, and the Photo Editor. A help-centre
// search for "API" returns PayPal's API and an Instagram feed - nothing of their own.
// Community reverse-engineered endpoints exist; building client delivery on undocumented
// private endpoints would put the photographer's paid deliverables one silent upstream
// deploy away from breaking, so we do not.
//
// So this script does the part that IS ours: it lays a shoot out in the shape Pixieset's
// uploader expects - one folder per Collection, one subfolder per Set - in delivery order,
// so the remaining human action is a single drag into the web uploader.
//
// If the shoot is in Lightroom, prefer the Pixieset Publish Service instead: it creates the
// Collection and Sets for you and re-publishes edits. This script is for the case where the
// finished exports are already sitting in a folder.
//
//   npm run delivery:prepare -- --from <folder> --collection "Lucie & Thomas" [--set Ceremonie]
//
// It COPIES. It never moves, renames in place, or deletes a source photograph.

import { readdirSync, existsSync, mkdirSync, copyFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readPhoto } from "./lib/photo-meta.mjs";

const argv = process.argv.slice(2);
const arg = (name, fallback = "") => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const from = arg("from");
const collection = arg("collection");
const set = arg("set", "Highlights"); // Pixieset creates a "Highlights" set by default
const outRoot = path.resolve(arg("out", "client-delivery"));

if (!from || !collection) {
  console.error(`delivery:prepare - stage a shoot for Pixieset upload.

  npm run delivery:prepare -- --from <folder> --collection "<name>" [--set "<set>"] [--out <dir>]

  --from        folder of finished exports (the full client take, not the portfolio edit)
  --collection  the Pixieset Collection name, e.g. "Lucie & Thomas"
  --set         Set within the collection (default "Highlights")
  --out         destination root (default ./client-delivery)

Pixieset has no public API; this prepares the upload so the manual step is one drag.`);
  process.exit(1);
}

if (!existsSync(from) || !statSync(from).isDirectory()) {
  console.error(`delivery:prepare - not a folder: ${from}`);
  process.exit(1);
}

// Keep the folder name as close to the Pixieset Collection/Set name as the filesystem
// allows: the photographer is about to look for it by that name in a file picker. Only
// genuinely illegal characters are replaced - spaces, ampersands and hyphens are legal
// everywhere we care about, and mangling them just makes the folder harder to find.
// No control-character range here: a Collection name arrives from a CLI argument, and an
// earlier attempt to encode that range wrote the raw bytes, turning this script into a
// binary blob as far as git was concerned.
const ILLEGAL = /[<>:"/\\\|?*]/g;
const safe = (s) => s.replace(ILLEGAL, "-").replace(/\s+/g, " ").replace(/[. ]+$/, "").trim();

const collectionDir = path.join(outRoot, safe(collection));
const dest = path.join(collectionDir, safe(set));
mkdirSync(dest, { recursive: true });

const files = readdirSync(from).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (files.length === 0) {
  console.error(`delivery:prepare - no photographs in ${from}`);
  process.exit(1);
}

// Delivery order is chronological: a client scrolling their gallery should walk the day
// forwards. Frames without a capture time keep filename order, after the dated ones.
const entries = [];
const damaged = [];
for (const f of files) {
  const meta = await readPhoto(path.join(from, f));
  if (!meta.ok) {
    damaged.push(`${f} - ${meta.error}`);
    continue;
  }
  entries.push({ file: f, capturedAt: meta.capturedAt });
}
entries.sort((a, b) => {
  if (a.capturedAt && b.capturedAt) return a.capturedAt.localeCompare(b.capturedAt);
  if (a.capturedAt) return -1;
  if (b.capturedAt) return 1;
  return a.file.localeCompare(b.file);
});

const pad = String(entries.length).length;
let copied = 0;
for (let i = 0; i < entries.length; i++) {
  const ext = path.extname(entries[i].file).toLowerCase();
  const target = path.join(dest, `${String(i + 1).padStart(pad, "0")}${ext}`);
  if (!existsSync(target)) {
    copyFileSync(path.join(from, entries[i].file), target);
    copied++;
  }
}

// A plain receipt beside the staged folder: what came from where, in what order. Not
// uploaded - it is for the photographer, and it is the only record mapping the delivery
// numbering back to the original filenames.
writeFileSync(
  path.join(collectionDir, "MANIFEST.txt"),
  `Collection: ${collection}\nSet: ${set}\nSource: ${path.resolve(from)}\n` +
    `Prepared: ${new Date().toISOString().slice(0, 10)}\nFrames: ${entries.length}\n\n` +
    `Delivery order (chronological by capture time):\n` +
    entries
      .map(
        (e, i) =>
          `  ${String(i + 1).padStart(pad, "0")}  <-  ${e.file}` +
          (e.capturedAt ? `  ${e.capturedAt}` : "  (no capture time)"),
      )
      .join("\n") +
    (damaged.length ? `\n\nSKIPPED (unreadable):\n` + damaged.map((d) => "  " + d).join("\n") : "") +
    "\n",
  "utf8",
);

console.log(
  `delivery:prepare - ${entries.length} frame(s) staged ` +
    `(${copied} copied, ${entries.length - copied} already present)`,
);
if (damaged.length) {
  console.log(`  skipped ${damaged.length} unreadable file(s):`);
  for (const d of damaged) console.log("    - " + d);
}
console.log(`  -> ${dest}`);
console.log(`\nNext, in Pixieset (no API exists - this is the supported path):`);
console.log(`  In Lightroom: publish via the Pixieset Publish Service - it creates the`);
console.log(`  Collection/Set for you and re-publishes edits.`);
console.log(`  Otherwise: new Collection "${collection}" -> drag "${safe(set)}" into the uploader.`);
