# Image Guidelines & Placeholder → Real Migration Plan

**Date:** 2026-06-20
**Audience:** the photographer + whoever exports/registers the images.

The site is **placeholder-first by design**: every image slot already reserves its exact aspect ratio, so dropping in a real photograph causes **zero layout shift** (CLS ≈ 0). This document explains how the placeholder system works and exactly how to replace it.

---

## 1. How the placeholder system works (so migration is safe)

- A photo is modelled by `GalleryImage` (`src/types/gallery.ts`): `{ src?, width?, height?, alt, ratio?, label?, hint? }`.
- **No `src`** → `ImageFigure` renders a *directed reserved frame* (a warm art-board showing orientation · ratio + an art-direction note).
- **`src` present** → it renders an optimised `next/image` (responsive, lazy, AVIF/WebP, fades in) in the **same aspect-ratio frame**.
- The frame's height is reserved by the `ratio` token, so **adding `src` + `width`/`height` changes nothing in the layout** — the photo simply fills the frame.

**Therefore migration = data only.** No component changes, no spacing changes.

---

## 2. Ideal aspect ratios

Use the ratio the photograph was composed for; the grid is built to handle a **mixed, human edit**. Supported tokens (already used across the galleries):

| Token | Ratio | Use for |
|---|---|---|
| `aspect-[4/5]` | 4:5 portrait | Default portrait orientation (families, portraits) |
| `aspect-[2/3]` | 2:3 portrait | Taller portraits |
| `aspect-[3/4]` | 3:4 portrait | Gentle portrait |
| `aspect-[1/1]` | 1:1 square | Detail shots, Instagram-native frames |
| `aspect-[5/4]` | 5:4 landscape | Soft landscape |
| `aspect-[3/2]` | 3:2 landscape | Classic 35mm landscape |
| `aspect-[16/9]` | 16:9 wide | Full-width / full-bleed feature frames |

**Fixed-ratio slots (match these exactly):**
- **Hero** (`content/home.ts` → `hero.image`): wide landscape, composed for **16:9**, with subject placed lower-left (text sits bottom-left over a scrim).
- **About portrait** (`content/photographer.ts` / about page): **4:5** portrait, eyes upper-third.
- **Homepage séance full-bleed** scene: **16:9** landscape with headroom for an overlaid title.
- **Homepage reel** (`content/galleries.ts` → `featured`): mixed ratios are intentional — keep them varied.

> Don't crop a photo to a ratio it wasn't made for just to fit a slot — change the slot's `ratio` token instead. The layout absorbs it.

---

## 3. Recommended resolutions & export

`next/image` generates responsive sizes automatically; you provide **one high-quality master per image** and its **intrinsic pixel dimensions**.

| Image | Export long edge | Notes |
|---|---|---|
| Hero | **2400 px** wide | It's the LCP/full-bleed; quality matters, but compress well. |
| Full-bleed séance | 2400 px wide | Same as hero. |
| Gallery / reel | **1600–2000 px** long edge | Plenty for `next/image` to downscale per device. |
| About portrait | 1600 px long edge | |
| OG/social card | 1200 × 630 (see §7) | |

- **Format to ship:** export high-quality **JPEG** (or source); `next/image` re-encodes to AVIF/WebP at request/build (configured in `next.config.ts`). You don't need to pre-make WebP/AVIF.
- **Always record `width` + `height`** (the master's intrinsic pixels). The type requires it when `src` is set — it's what reserves space.
- **Colour profile:** export **sRGB** (avoids dull/odd colours in browsers).

---

## 4. File naming conventions

Lowercase, hyphenated, descriptive, ASCII-only (no spaces, accents, or client surnames for privacy). Pattern:

```
/public/galleries/<genre>/<genre>-<short-descriptor>-<NN>.jpg
```

Examples:
```
/public/galleries/familles/familles-dimanche-matin-01.jpg
/public/galleries/couples/couples-bord-de-saone-03.jpg
/public/galleries/mariages/mariages-ceremonie-12.jpg
/public/home/hero-coucher-de-soleil.jpg
/public/about/portrait-studio.jpg
```

- `<genre>` ∈ `familles | couples | grossesse | mariages | portraits`.
- `NN` = zero-padded order (`01`, `02`, …) so files sort in edit order.
- Keep client identities out of filenames (privacy + RGPD hygiene).

---

## 5. Compression workflow

1. **Cull + grade** in your editor (Lightroom/Capture One). Colour and B&W both welcome — sequence them with intent.
2. **Export** to sRGB JPEG at the long edge in §3, quality ~80–85 (visually lossless at these sizes).
3. **Optimise** once more (optional but recommended): Squoosh, ImageOptim, or `sharp`/`@squoosh/cli`. Target **< 400 KB** for gallery images, **< 600 KB** for the hero master. (`next/image` will produce far smaller per-device variants from these.)
4. **Place** files under `/public/...` per §4.
5. **Register** in the content file (§6) with `src`, `width`, `height`, and real `alt`.
6. **Verify**: `npm run build`, then check the page — no layout shift, image crisp on retina, fast LCP on the hero.

> Do **not** commit the temporary `public/demo/` stand-ins to production — delete them (they're now unreferenced).

---

## 6. Registering a real image (data change)

**Gallery** (`content/galleries.ts`) — replace a placeholder entry:
```ts
// before (reserved frame)
placeholder("Photographie de famille", "aspect-[4/5]"),
// after (real photo)
{
  src: "/galleries/familles/familles-dimanche-matin-01.jpg",
  width: 1600, height: 2000,           // intrinsic px → reserves space (CLS 0)
  alt: "Trois générations enlacées dans la cuisine, lumière du matin",
  ratio: "aspect-[4/5]",
},
```

**Hero** (`content/home.ts`):
```ts
hero: {
  …,
  image: {
    src: "/home/hero-coucher-de-soleil.jpg",
    width: 2400, height: 1350,
    alt: "Une famille réunie à contre-jour, fin de journée",
  },
},
```

That's the whole migration: add fields, nothing else moves.

---

## 7. Alt-text strategy

Alt text is required for every real image (accessibility + SEO). It's already a required field on the type.

- **Describe the scene, in French**, plainly: who/what + the feeling or light. *"Une mariée rit pendant la cérémonie, lumière chaude."*
- **Be specific, not keyword-stuffed.** No "photo de mariage Lyon photographe pas cher".
- **No client names** (privacy).
- **Decorative/reserved frames** carry no alt (they're `aria-hidden` art-boards) — only real photos need it.
- **When localized:** alt text lives in the content and will translate via the dictionary like any other string.

---

## 8. Open Graph image requirements

- **Current:** an on-brand, typographic OG/Twitter card is generated automatically (`src/lib/og.tsx` → `opengraph-image` / `twitter-image`), 1200 × 630, dependency-free. No action needed for launch.
- **Upgrade (optional, post-launch):** swap to a **photo-backed** card once a signature frame exists.
  - Size **1200 × 630** (1.91:1), sRGB, < 1 MB.
  - Keep the most important subject **center-safe** (platforms crop edges).
  - If overlaying the brand text, ensure contrast (a scrim, as the hero uses).
  - Either replace the renderer in `lib/og.tsx` with an image-backed `ImageResponse`, or drop a static `app/opengraph-image.png`.
- **Per-page OG (optional, later):** add `opengraph-image` files under specific routes (e.g. a wedding gallery) for tailored share cards.

---

## 9. Migration checklist (per batch)

- [ ] Photos culled, graded, sRGB-exported at the right long edge
- [ ] Optimised under size targets
- [ ] Named per convention, placed under `/public/...`
- [ ] Registered with `src` + `width` + `height` + real French `alt`
- [ ] `npm run build` clean; page shows no layout shift; hero LCP fast
- [ ] `public/demo/` removed before launch
