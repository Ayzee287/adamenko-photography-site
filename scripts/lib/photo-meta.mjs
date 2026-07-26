// Derived photograph facts — the half of a story's metadata no human should ever type.
//
// Everything here is read off the file itself: dimensions, orientation, capture time,
// a content hash for idempotency, and integrity. Nothing here is an editorial decision,
// and nothing here is ever written back into a human-owned file.
//
// GPS IS DELIBERATELY NOT EXTRACTED. `readCaptureDate` walks the EXIF IFDs for one tag
// and stops; the GPS IFD is never followed and no coordinate ever enters a manifest.
// (The published exports are separately GPS-free because sharp drops all metadata on
// re-encode — asserted in tests/unit/story-privacy.test.ts, not merely assumed.)

import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** EXIF tag for the moment the shutter fired. */
const DATE_TIME_ORIGINAL = 0x9003;
const DATE_TIME_DIGITIZED = 0x9004;
const EXIF_IFD_POINTER = 0x8769;

/**
 * Minimal TIFF/EXIF reader for capture time only.
 *
 * A dependency for one string would be a poor trade, and a general EXIF library would
 * happily hand us GPS we have no business holding. This walks IFD0, follows the Exif
 * sub-IFD pointer, and reads DateTimeOriginal (falling back to DateTimeDigitized).
 * Returns null on anything unexpected — a missing date is a fact, not an error.
 */
export function parseCaptureDate(exifBuffer) {
  if (!exifBuffer || exifBuffer.length < 8) return null;
  try {
    // sharp hands back the payload prefixed with "Exif\0\0"; skip it when present.
    let buf = exifBuffer;
    if (buf.slice(0, 4).toString("ascii") === "Exif") buf = buf.slice(6);
    if (buf.length < 8) return null;

    const order = buf.slice(0, 2).toString("ascii");
    if (order !== "II" && order !== "MM") return null;
    const LE = order === "II";
    const u16 = (o) => (LE ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
    const u32 = (o) => (LE ? buf.readUInt32LE(o) : buf.readUInt32BE(o));

    if (u16(2) !== 42) return null;

    const readAscii = (offset, count) =>
      buf.slice(offset, offset + count).toString("ascii").replace(/\0.*$/, "").trim();

    // Scan one IFD; return {date, exifPointer}
    const scanIfd = (start) => {
      if (start <= 0 || start + 2 > buf.length) return {};
      const count = u16(start);
      let date = null;
      let exifPointer = 0;
      for (let i = 0; i < count; i++) {
        const entry = start + 2 + i * 12;
        if (entry + 12 > buf.length) break;
        const tag = u16(entry);
        const type = u16(entry + 2);
        const num = u32(entry + 4);
        if (tag === EXIF_IFD_POINTER) {
          exifPointer = u32(entry + 8);
        } else if ((tag === DATE_TIME_ORIGINAL || tag === DATE_TIME_DIGITIZED) && type === 2) {
          // ASCII values >4 bytes live at an offset; shorter ones are inline.
          const at = num > 4 ? u32(entry + 8) : entry + 8;
          if (at + num <= buf.length) {
            const raw = readAscii(at, num);
            // EXIF spells it "YYYY:MM:DD HH:MM:SS"
            const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(raw);
            if (m && (tag === DATE_TIME_ORIGINAL || !date)) {
              date = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
            }
          }
        }
      }
      return { date, exifPointer };
    };

    const ifd0 = scanIfd(u32(4));
    if (ifd0.date) return ifd0.date;
    if (ifd0.exifPointer) {
      const sub = scanIfd(ifd0.exifPointer);
      if (sub.date) return sub.date;
    }
    return null;
  } catch {
    return null;
  }
}

/** Stable content hash of the SOURCE file — the idempotency key for re-encoding. */
export function hashFile(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex").slice(0, 16);
}

/**
 * Read every derived fact about one photograph.
 *
 * `ok:false` is returned rather than thrown for a damaged frame: a truncated JPEG has
 * valid headers (so `metadata()` succeeds) and only fails when the pixels are actually
 * decoded, which is exactly the case that must be caught before it reaches the site.
 * IMG_0148.JPG in the current library is that case.
 */
export async function readPhoto(absPath) {
  const meta = await sharp(absPath).metadata();
  const base = {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? "",
    capturedAt: parseCaptureDate(meta.exif),
    hash: hashFile(absPath),
  };

  // Force a full decode — the only way to prove the pixel data is intact.
  try {
    await sharp(absPath).raw().toBuffer();
  } catch (err) {
    return { ...base, ok: false, error: String(err.message || err).split("\n")[0] };
  }

  if (!base.width || !base.height) {
    return { ...base, ok: false, error: "no dimensions" };
  }
  return { ...base, ok: true, error: null };
}

/** Landscape / portrait / square — derived, never declared. */
export function orientationOf(width, height) {
  const ar = width / height;
  if (ar >= 1.15) return "landscape";
  if (ar <= 0.87) return "portrait";
  return "square";
}
