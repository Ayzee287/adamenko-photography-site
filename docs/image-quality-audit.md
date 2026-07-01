# Image quality audit (UI-polish pass)

**Symptom reported:** the photography looks softer / more pixelated than expected,
especially on large and high-DPI displays.

## What was audited

The complete `next/image` pipeline was checked end to end:

| Lever | Finding | Verdict |
| --- | --- | --- |
| **Format** (`images.formats`) | AVIF first, then WebP. | ✅ Correct. |
| **`sizes` on every surface** | Hero `100vw`; gallery grid `33/50/100vw` matching the column flow; reel height-driven (sizes slightly over-declare → sharper, not softer); discover `33vw`; lightbox `80/100vw`. | ✅ No under-declaration anywhere — not the cause. |
| **srcset / breakpoints** | Default `deviceSizes`/`imageSizes` generate the full candidate ladder (640…3840w). | ✅ Correct. |
| **Quality** | Default `next/image` quality is **75**. Re-encoding already-compressed JPEGs to AVIF/WebP at 75 smooths fine detail (skin, hair, fabric). | ⚠️ **Compression-limited softness — fixable.** |
| **Source resolution** | Every master caps at **1280px on the long edge** (hero 1280×853, gallery frames 1280/853, portrait 853×1198). | ⛔ **The real ceiling — owner content.** |

## The two real causes

1. **Compression (fixable here).** Raised the encode quality from the default 75 to a
   measured **82** for all photographs and **85** for the lightbox (the dedicated
   "examine the photo" surface). Configured via `images.qualities = [75, 82, 85]`
   (Next 16 restricts `quality` to this list). We deliberately do **not** chase 100 —
   AVIF gains nothing visible there for a large byte penalty.
   - Hero @1280: q75 AVIF ≈ **68 KB** → q82 ≈ **83 KB** (+15 KB). A negligible LCP cost
     for a visibly cleaner encode; the gallery images are lazy-loaded so their bump is free.

2. **Source resolution (the dominant cause — NOT fixable in code).** `next/image`
   **never upscales beyond the source**. Proven against the running optimizer: the hero
   srcset advertises candidates up to `w=3840`, but `w=1920` and `w=3840` return
   **byte-identical** output (83122 B) because both are the 1280px master re-encoded.

   ```
   w=1080 -> 66857 B   (a real 1080px image)
   w=1920 -> 83122 B   ┐ identical → capped at the 1280px source,
   w=3840 -> 83122 B   ┘ the browser then upscales it to fill a retina viewport
   ```

   On a ~1440px viewport at DPR 2 the browser wants ~2880px, requests the 3840w
   candidate, and receives a 1280px-max image → it upscales → **soft / pixelated**.
   Quality cannot fix this; only a higher-resolution master can.

## Recommendation to the owner (durable fix)

Supply higher-resolution masters and the softness on large/full-bleed surfaces
disappears with **zero code change** (the pipeline already requests up to 3840w):

- **Hero / full-bleed séance band:** ≥ **2400px** on the long edge (ideally 3000–3840px).
- **Gallery + lightbox images:** ≥ **2000px** on the long edge.
- **About portrait:** ≥ **1600px** on the long edge.

Keep exporting high-quality JPEG (q90+) or PNG masters; `next/image` does the
AVIF/WebP/responsive work. No source should be pre-shrunk to 1280px before upload.

## What changed in this pass

- `next.config.ts` — `images.qualities = [75, 82, 85]`.
- `ImageFigure` — new `quality` prop, default **82** (covers galleries, reel, séance
  spread, gallery covers, about portrait).
- Explicit `quality` on the raw `<Image>` surfaces: hero **82**, discover **82**,
  séance full-bleed band **82**, lightbox **85**.
