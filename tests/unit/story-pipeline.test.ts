// The story pipeline's contracts, asserted rather than trusted.
//
// These cover the promises that are expensive to discover the hard way: that a story is
// not published by being found, that a human's editorial line is never rewritten, that a
// frame someone deliberately removed does not come back, and that no GPS survives export.

import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  parseStorySheet, syncStorySheet, DEFAULT_VISIBILITY, VISIBILITIES,
} from "../../scripts/lib/story-sheet.mjs";
import { parseCaptureDate, orientationOf } from "../../scripts/lib/photo-meta.mjs";

type SheetPhoto = { file: string; alt: string; altEn: string };

const tmp = () => mkdtempSync(path.join(tmpdir(), "story-"));

describe("visibility — being found is not consent to publish", () => {
  it("defaults a newly discovered story to draft, never portfolio", () => {
    const dir = tmp();
    const sheet = path.join(dir, "story.txt");
    syncStorySheet(sheet, "mariages", "a-shoot", ["A.JPG", "B.JPG"]);
    const parsed = parseStorySheet(readFileSync(sheet, "utf8"));
    expect(parsed.visibility).toBe(DEFAULT_VISIBILITY);
    expect(parsed.visibility).not.toBe("portfolio");
  });

  it("rejects a visibility outside the known set rather than guessing", () => {
    const parsed = parseStorySheet("visibility: public\nA.JPG | alt | alt");
    expect(parsed.problems.join()).toMatch(/visibility "public"/);
    // and falls back to the safe state, not the requested one
    expect(parsed.visibility).toBe(DEFAULT_VISIBILITY);
  });

  it("knows exactly three visibilities", () => {
    expect(VISIBILITIES).toEqual(["private", "draft", "portfolio"]);
  });
});

describe("the editorial boundary — the tool never edits a human's words", () => {
  it("appends new frames without touching existing lines", () => {
    const dir = tmp();
    const sheet = path.join(dir, "story.txt");
    syncStorySheet(sheet, "familles", "s", ["A.JPG"]);
    // a human writes a title and real alt text
    const text = readFileSync(sheet, "utf8")
      .replace("title:\n", "title: Une vraie histoire\n")
      .replace("A.JPG | | ", "A.JPG | un enfant qui rit | a laughing child");
    writeFileSync(sheet, text);

    const res = syncStorySheet(sheet, "familles", "s", ["A.JPG", "B.JPG"]);
    expect(res.appended).toEqual(["B.JPG"]);

    const after = parseStorySheet(readFileSync(sheet, "utf8"));
    expect(after.title).toBe("Une vraie histoire");
    const byName = (f: string): SheetPhoto | undefined =>
      (after.photos as SheetPhoto[]).find((p) => p.file === f);
    expect(byName("A.JPG")?.alt).toBe("un enfant qui rit");
    expect(byName("A.JPG")?.altEn).toBe("a laughing child");
    // the new frame arrives blank, awaiting a human
    expect(byName("B.JPG")?.alt).toBe("");
  });

  it("does not resurrect a frame the human commented out, annotation and all", () => {
    const dir = tmp();
    const sheet = path.join(dir, "story.txt");
    syncStorySheet(sheet, "mariages", "s", ["A.JPG", "B.JPG"]);
    const text = readFileSync(sheet, "utf8").replace(
      "B.JPG | | ",
      "# B.JPG  (dropped: truncated file)",
    );
    writeFileSync(sheet, text);

    const res = syncStorySheet(sheet, "mariages", "s", ["A.JPG", "B.JPG"]);
    expect(res.appended).toEqual([]);
    expect(readFileSync(sheet, "utf8")).not.toMatch(/^B\.JPG/m);
  });

  it("is a no-op when nothing on disk has changed", () => {
    const dir = tmp();
    const sheet = path.join(dir, "story.txt");
    syncStorySheet(sheet, "portraits", "s", ["A.JPG"]);
    const before = readFileSync(sheet, "utf8");
    const res = syncStorySheet(sheet, "portraits", "s", ["A.JPG"]);
    expect(res).toEqual({ created: false, appended: [] });
    expect(readFileSync(sheet, "utf8")).toBe(before);
  });

  it("names an unknown field instead of silently dropping it", () => {
    const parsed = parseStorySheet("titel: oops\nA.JPG | a | b");
    expect(parsed.problems.join()).toMatch(/unknown field "titel:"/);
  });
});

describe("derived facts", () => {
  it("reads a capture date out of a little-endian EXIF block", () => {
    // Hand-built minimal TIFF: II, magic 42, IFD0 at 8, one DateTimeOriginal entry.
    const date = "2024:06:15 14:30:00\0";
    const buf = Buffer.alloc(8 + 2 + 12 + 4 + date.length);
    buf.write("II", 0, "ascii");
    buf.writeUInt16LE(42, 2);
    buf.writeUInt32LE(8, 4);
    buf.writeUInt16LE(1, 8); // one entry
    buf.writeUInt16LE(0x9003, 10); // DateTimeOriginal
    buf.writeUInt16LE(2, 12); // ASCII
    buf.writeUInt32LE(date.length, 14);
    buf.writeUInt32LE(26, 18); // value offset
    buf.write(date, 26, "ascii");
    expect(parseCaptureDate(buf)).toBe("2024-06-15T14:30:00");
  });

  it("treats an unreadable EXIF block as 'no date', not an error", () => {
    expect(parseCaptureDate(null)).toBeNull();
    expect(parseCaptureDate(Buffer.from([1, 2, 3]))).toBeNull();
    expect(parseCaptureDate(Buffer.from("not exif at all"))).toBeNull();
  });

  it("derives orientation from the dimensions", () => {
    expect(orientationOf(3000, 2000)).toBe("landscape");
    expect(orientationOf(2000, 3000)).toBe("portrait");
    expect(orientationOf(2000, 2000)).toBe("square");
  });
});

describe("the sheet is the order", () => {
  it("keeps photographs in written order, not filesystem order", () => {
    const parsed = parseStorySheet(
      ["Z.JPG | z | z", "A.JPG | a | a", "M.JPG | m | m"].join("\n"),
    );
    expect((parsed.photos as SheetPhoto[]).map((p) => p.file)).toEqual(["Z.JPG", "A.JPG", "M.JPG"]);
  });
});

describe("privacy — only a portfolio story may sit in the deployable web root", () => {
  it("keeps every unpublished story's photographs out of /public/stories", async () => {
    const { stories } = await import("../../src/content/stories.generated");
    for (const s of stories) {
      const expected = s.visibility === "portfolio" ? "/stories/" : "/stories-draft/";
      for (const img of s.images) {
        expect(
          img.src.startsWith(expected),
          `${s.id} is "${s.visibility}" but serves ${img.src} — a route gate hides the page, not the JPEG`,
        ).toBe(true);
      }
      expect(s.cover.startsWith(expected), `${s.id} cover is in the wrong root`).toBe(true);
    }
  });

  it("never emits a `private` story into the model at all", async () => {
    const { stories } = await import("../../src/content/stories.generated");
    expect(stories.some((s) => s.visibility === "private")).toBe(false);
  });
});

describe("privacy — location is opt-in and GPS is never a source", () => {
  it("leaves location empty unless a human typed one", () => {
    const dir = tmp();
    const sheet = path.join(dir, "story.txt");
    mkdirSync(dir, { recursive: true });
    syncStorySheet(sheet, "mariages", "s", ["A.JPG"]);
    expect(parseStorySheet(readFileSync(sheet, "utf8")).location).toBe("");
  });

  it("exposes no GPS reader at all — the pipeline cannot leak what it cannot read", async () => {
    const meta = await import("../../scripts/lib/photo-meta.mjs");
    const surface = Object.keys(meta).join(" ").toLowerCase();
    expect(surface).not.toMatch(/gps|latitude|longitude|coord/);
  });
});
