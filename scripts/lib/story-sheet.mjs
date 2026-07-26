// story.txt — the EDITORIAL half. The only file in the pipeline a human maintains.
//
// Same plain-text `key: value` shape as curation/collections.txt (D094), for one reason:
// the photographer already edits that file, and a second syntax for the same kind of
// decision would be a tax with no payer. No YAML dependency, no JSON escaping traps.
//
// THE CONTRACT, both directions:
//   · the tool WRITES this file only when it does not exist, and only ever APPENDS
//     newly-discovered photo lines to an existing one;
//   · the tool NEVER edits, reorders or removes a line a human has written.
// Everything derivable (dimensions, orientation, capture time, hashes, counts) is
// deliberately absent here — it is read off the photographs on every run instead.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

/** A story is invisible until someone says otherwise. `draft` is the safe landing state. */
export const VISIBILITIES = ["private", "draft", "portfolio"];
export const DEFAULT_VISIBILITY = "draft";

const KEYS = new Set(["title", "title.en", "description", "description.en", "visibility", "cover", "date", "location"]);

/**
 * Parse a story.txt. Returns editorial fields plus the ordered photo lines.
 * Unknown keys are reported rather than ignored — a typo'd `titel:` must not silently
 * become an untitled story.
 */
export function parseStorySheet(text) {
  const out = {
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    visibility: DEFAULT_VISIBILITY,
    cover: "",
    date: "",
    location: "",
    photos: [],
    problems: [],
  };

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const ln = i + 1;

    const kv = /^([a-z.]+):\s*(.*)$/.exec(line);
    if (kv && KEYS.has(kv[1])) {
      const [, key, value] = kv;
      if (key === "title") out.title = value;
      else if (key === "title.en") out.titleEn = value;
      else if (key === "description") out.description = value;
      else if (key === "description.en") out.descriptionEn = value;
      else if (key === "cover") out.cover = value;
      else if (key === "date") out.date = value;
      else if (key === "location") out.location = value;
      else if (key === "visibility") {
        if (!VISIBILITIES.includes(value)) {
          out.problems.push(`line ${ln}: visibility "${value}" is not one of ${VISIBILITIES.join(" | ")}`);
        } else out.visibility = value;
      }
      return;
    }
    if (kv && !KEYS.has(kv[1])) {
      out.problems.push(`line ${ln}: unknown field "${kv[1]}:"`);
      return;
    }

    // a photo line: FILE | fr alt | en alt
    const parts = line.split("|").map((s) => s.trim());
    const file = parts[0];
    if (!file) return;
    out.photos.push({ file, alt: parts[1] || "", altEn: parts[2] || "", line: ln });
  });

  return out;
}

const header = (category, slug) => `# ═══════════════════════════════════════════════════════════════════════════
# STORY — ${category} / ${slug}
# ═══════════════════════════════════════════════════════════════════════════
#
# This file is the EDIT. The tool wrote the photo list once, from the folder;
# from here on it only ever APPENDS frames it has never seen. It will not
# rewrite, reorder or delete anything below — that is yours.
#
#   THE ORDER OF THE LINES IS THE ORDER ON THE WALL.
#   Re-order the story = move lines. Drop a frame = delete (or #-comment) its line.
#
# ── Publishing ────────────────────────────────────────────────────────────
#   visibility: private    never built, never deployed
#               draft      built locally so you can look at it; NOT published
#               portfolio  public on the website
#
#   A new story starts at "${DEFAULT_VISIBILITY}". Nothing becomes public by being found.
#
# ── Required before it can go to "portfolio" ──────────────────────────────
#   title:   a real title (FR).  Alt text on every frame.
#   Everything else — dimensions, orientation, capture date, ordering default,
#   counts, integrity — is read off the photographs. Never type it here.
#
# ── Fields ────────────────────────────────────────────────────────────────
#   title / title.en · description / description.en · cover: FILE
#   date: YYYY-MM-DD   (optional — otherwise the earliest capture time is used)
#   location: ...      (optional and PUBLIC if set — omit for private venues)
# ═══════════════════════════════════════════════════════════════════════════

title:
title.en:
description:
description.en:
visibility: ${DEFAULT_VISIBILITY}
cover:

# ── Photographs · FILE | alt text (FR) | alt text (EN) ─────────────────────
`;

/**
 * Create a story.txt if absent, or append photographs discovered since the last run.
 * Returns {created, appended} so the caller can tell the human exactly what changed.
 */
export function syncStorySheet(sheetPath, category, slug, files) {
  if (!existsSync(sheetPath)) {
    const body = files.map((f) => `${f} | | `).join("\n");
    writeFileSync(sheetPath, header(category, slug) + body + "\n", "utf8");
    return { created: true, appended: [] };
  }

  const text = readFileSync(sheetPath, "utf8");
  const known = new Set(parseStorySheet(text).photos.map((p) => p.file));
  // A commented-out line is a deliberate removal — respect it, never re-add.
  //
  // Match only the FILENAME token, not the rest of the line: people annotate the reason
  // they dropped a frame ("# IMG_0148.JPG  (truncated file)"), and an earlier version of
  // this captured the annotation too, so the name never matched and the tool helpfully
  // put the rejected photograph straight back.
  const commented = new Set(
    text
      .split(/\r?\n/)
      .map((l) => /^#\s*([^\s|#]+\.(?:jpe?g|png))/i.exec(l.trim())?.[1])
      .filter(Boolean),
  );
  const fresh = files.filter((f) => !known.has(f) && !commented.has(f));
  if (fresh.length === 0) return { created: false, appended: [] };

  const suffix =
    (text.endsWith("\n") ? "" : "\n") +
    `\n# ── appended ${new Date().toISOString().slice(0, 10)} — new frames found in the folder\n` +
    fresh.map((f) => `${f} | | `).join("\n") +
    "\n";
  writeFileSync(sheetPath, text + suffix, "utf8");
  return { created: false, appended: fresh };
}
