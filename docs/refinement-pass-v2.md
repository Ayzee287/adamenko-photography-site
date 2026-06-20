---
title: Refinement Pass v2 — Placeholder-First, Editorial
project: Adamenko Photography
date: 2026-06-20
status: implemented
branch: flagship-homepage
tags: [design-system, homepage, placeholders, interaction, cta, reel]
---

# Refinement Pass v2 — making the design stand on its own

> The final test, stated up front: **if every non-essential photograph is replaced
> with a placeholder, the site must still feel like a flagship custom experience.**
> This pass makes that true. Photography now *amplifies* the design instead of
> rescuing it.

This was a **refinement**, not a redesign. No homepage section was added or removed;
the section order and content model are untouched. The work strengthens the existing
system: a directed placeholder language, an exhibition-grade reel, a quieter dual-CTA
language, tighter rhythm, and a more editorial footer/header.

---

## Goals

1. Stop the layout depending on temporary demo photography.
2. Make every placeholder a piece of **art direction**, not an empty beige box.
3. Rebuild the reel as an **exhibition rail** (browsing framed prints), not a carousel.
4. Replace generic square buttons with a restrained **dual-CTA** language.
5. Improve rhythm and density without adding components or chrome.
6. Trim the contact band; make the footer and nav more editorial and legible.
7. Keep SSR/static output, type safety, zero hydration risk, CLS-safe frames.

---

## Design decisions

| # | Decision | Why |
|---|----------|-----|
| D-v2-1 | **Demo imagery kept only in the hero and the reel.** Emotion spreads, about, and discover now render directed placeholders. | The hero and reel are the two places where a real photo is needed to validate *composition*; everywhere else the design must prove itself on typography and space. |
| D-v2-2 | **Placeholders are directed art-boards** — `ORIENTATION · RATIO`, a subject `label`, and a one-line art-direction note. | A placeholder should *brief the photographer*, not apologise. It tells you exactly what frame belongs there. |
| D-v2-3 | **Reel = fixed-height rail, variable widths from natural aspect ratios.** No autoplay, no loop, no arrows, no dots. | An exhibition wall: prints hung at one height, widths set by the image. Control belongs to the visitor; a carousel takes it away. |
| D-v2-4 | **Primary CTA is a thin-border pill that fills gently on hover; one per viewport.** Everything else is a secondary text link. | The loud clay-wipe button read as "SaaS". A quiet pill + text links is editorial and lets the rare primary actually mean something. |
| D-v2-5 | **Pricing CTAs demoted to secondary**, leaving the closing contact CTA as the page's single primary. | Honours "one primary per viewport" and keeps pricing informational, not pushy. |
| D-v2-6 | **De-card the discover trio**: reserved frame + caption *below*, no scrim/sliding-panel. | The old hover trick only worked once a photo existed. The new form works identically with a placeholder or a real photo. |

---

## What changed, section by section

### Placeholder system — `ui/image-figure.tsx` (the keystone)
- **Before:** a flat warm rectangle with one italic hint line.
- **After:** a warm tonal field with a soft directional light (radial gradient), captioned with:
  - top line — `Paysage · 16:9` / `Portrait · 4:5` (orientation + ratio parsed from the `aspect-[w/h]` token), with an optional plate index on the right;
  - a subject `label` (e.g. *La photographe*);
  - a one-line **art-direction note** (e.g. *"Silhouette à contre-jour. Les mains sur le ventre. Cadrage proche, fenêtre."*).
- Aspect-ratio token still reserves the exact frame, so the real export drops in with **CLS ≈ 0** and zero layout change.
- New optional `label` field on `GalleryImage` (`types/gallery.ts`).

### Hero — unchanged (demo image retained, allowed)
Only the **header scrim** above it changed (see Navigation).

### Emotion spreads — `home/services-showcase.tsx`
- Removed the four demo `src`s from content; the split/full-width spreads now render directed placeholders automatically through `ImageFigure`.
- **`FullBleed`** rewritten to support a *directed dark frame* when no photo exists: a warm-black radial field + a paper-tinted art-direction caption, so the pattern-break still lands without a photograph. Height reduced from `82/88vh` → `72/80vh` to cut dead space.
- Scene type made explicit with an **optional `src`**, so a real export can be reintroduced as pure data.

### About — `home/about-preview.tsx`
- Portrait is a reserved 4:5 frame with a `La photographe` label and an art-direction note. The bio + values column already carries the section, so it reads complete without a face.

### Reel — `gallery/horizontal-gallery.tsx` (rebuilt)
- **Fixed container height:** `280px` (mobile) → `400px` (sm) → `480px` (lg). Within the 240–320 / 420–520 targets.
- **Variable widths** derived from each image's natural aspect ratio at the shared height (portraits narrow, landscapes wide).
- **Gap** `12px → 16px` (`gap-3 sm:gap-4`); scrollbar hidden; `scroll-pl` aligns the first frame to the container edge.
- **Interactions:** mouse drag, touch swipe (native momentum), **vertical wheel → horizontal scroll** (boundary-aware so the page still scrolls past the ends), gentle scroll-snap (`snap-x` proximity + `snap-start`), grab/grabbing cursor.
- **Removed:** autoplay, the tripled infinite loop, the off-screen/visibility/hover/focus autoplay plumbing, and the per-frame `vh` height table — ~90 lines lighter.
- Click still opens the shared Lightbox; drag-vs-click is still discriminated.

### Pricing — `home/pricing-investment.tsx`
- Both package CTAs → **secondary** text links. The hairline-separated, de-boxed layout is unchanged.

### Discover — `home/discover-cards.tsx` (rebalanced)
- Reserved frames in an asymmetric trio (col-spans 5/4/3, varied ratios + offsets), each with its **label + title + arrow set below** the frame. De-carded: no border, no scrim, no sliding panel. Works on placeholders now, accepts real photos later with no layout change.

### Testimonials — `home/testimonials.tsx`
- Empty (honest, never fabricated) state tightened: `py-14 sm:py-24` instead of `py-32`, so an empty section doesn't claim a full section's height.

### Contact / final CTA — `home/final-cta.tsx`
- Vertical padding `py-36 → py-28` (~22% shorter) plus tighter internal spacing. Hierarchy sharpened: one primary pill (*Me contacter*) + one secondary link (*Instagram*). Copy width narrowed for a more decisive close.

### Footer — `layout/site-footer.tsx`
- From a two-column technical block to one editorial line: large serif brand, a quiet inline nav + Instagram row, and a single slim copyright under one hairline. Far less small print, stronger hierarchy.

### Navigation — `layout/site-header.tsx`
- Added a **legibility scrim** (`from-ink/50 → transparent`, top `h-24`) that appears *only* while the header floats transparent over the hero — readable over any frame, no visible chrome. Bumped over-hero contrast (brand `paper/90`, links `paper/75`, Instagram `paper/65`). The scrolled state keeps its solid `bg-paper/90 backdrop-blur`. Inner pages are unchanged.

### CTAs — `ui/button-link.tsx` (rewritten)
- **Primary:** pill (`rounded-full`, `52px`), thin border, no fill at rest; on hover the surface fills gently (ink on light / paper on dark, via the global interaction clock ~250–300ms) and the arrow advances `5px`. Light + dark variants.
- **Secondary:** unchanged in spirit — a text link whose clay underline draws from the left, with an advancing arrow. No border, no box, ever.
- The contact-form submit and the prestations CTA were brought onto the same pill language.

---

## Before vs after reasoning

- **"Calm because elegant" vs "calm because empty."** Before, removing a demo photo left a beige void; the section looked broken. After, the same frame *briefs* a photograph and is anchored by typography — the calm is intentional.
- **Reel.** Before: an oversized, auto-drifting, infinitely-looping wall that fought the page rhythm and took control from the visitor. After: a fixed-height rail you browse like framed prints — quieter, lighter, and entirely in the visitor's hands.
- **Buttons.** Before: filled square buttons with a loud clay wipe read as a component library. After: a single restrained pill + text links read as a magazine.
- **Density.** Before: primary buttons repeated (pricing ×2 + contact) diluted the call to act. After: exactly one primary per viewport.

---

## Technical changes

- `types/gallery.ts` — added optional `label`.
- `ui/image-figure.tsx` — `describeFrame()` parses the aspect token to French orientation + ratio; richer reserved-frame layout; subtle radial field.
- `ui/button-link.tsx` — pill primary with light/dark variants; transform-only arrow motion; colour/fill on the global clock.
- `gallery/horizontal-gallery.tsx` — removed autoplay/loop/IO plumbing; fixed-height flex rail; non-passive boundary-aware wheel handler; snap.
- `home/services-showcase.tsx` — explicit `Scene` type with optional `src`; `FullBleed` placeholder branch.
- `home/discover-cards.tsx` — de-carded, placeholder-first; routed through `ImageFigure`.
- `content/home.ts` — removed demo `src`s from `seances` + `discover`; art-direction notes rewritten as directed clauses; added `portraitLabel`.
- `home/final-cta.tsx`, `home/testimonials.tsx`, `layout/site-footer.tsx`, `layout/site-header.tsx`, `home/pricing-investment.tsx`, `contact-form.tsx`, `app/prestations/page.tsx` — as described above.

No dependencies added. No config changes.

### Interaction changes (summary)
- Reel: drag · swipe · **wheel→horizontal (boundary-aware)** · scroll-snap · grab cursor. No arrows/dots/autoplay/loop.
- Primary CTA: gentle fill + 5px arrow over ~250–300ms.
- Secondary CTA: drawing underline + advancing arrow.
- Discover: title→clay + arrow advance on hover (transform/colour only).
- All motion remains transform/opacity only and collapses to instant under `prefers-reduced-motion`.

---

## Verification results

- `npm run typecheck` — **pass** (clean).
- `npm run lint` — **pass** (clean).
- `npm run build` — **pass**; all **15 routes** prerendered (`○ Static` / `● SSG`). Homepage is fully static.
- Production server (`npm run start`) inspected via rendered HTML:
  - Reel renders **exactly 8 frames** (no clones → loop removed), scroller carries `h-[280px]/sm:400/lg:480`, `snap-x`, `gap-3/4`, hidden scrollbar; frames carry `aspect-[…] h-full` (the width-derivation mechanism).
  - Placeholder captions present and correct: `Portrait · 4:5` ×3, `Paysage · 16:9` ×2, `Paysage · 5:4`, `Portrait · 2:3`, `Portrait · 3:4`.
  - Demo images appear **only** in the hero + reel; emotion/about/discover are placeholder-only.
  - One primary pill per viewport on the homepage (the contact CTA); pricing CTAs are secondary.
  - `/a-propos`, `/prestations`, `/contact`, `/galeries` all 200 with the pill language applied.
- **Hydration:** components render deterministically on the server (no `window`/`Date`/random in render; `Reveal` renders visible on server + first client paint). No mismatch expected.

> **Screenshots:** not included — this environment has no headless browser (no Playwright/Puppeteer/Chrome available), so verification was done against rendered HTML/markup. To capture them, run `npm run dev` and view `/` at 390px and 1440px widths.

---

## Mobile review

- Reel height drops to `280px`; frames stay legible; native swipe + momentum; no page-level horizontal overflow (`overflow-x-auto overscroll-x-contain`, contained within the viewport).
- Placeholder captions use responsive padding (`p-5 sm:p-6`) and `max-w-[28ch]` so notes wrap cleanly on narrow screens.
- Discover trio collapses to a single column with the caption beneath each frame (offsets are `sm:`-only).
- Footer stacks brand → nav → copyright with comfortable spacing.
- CTAs are ≥44px touch targets (pill is 52px; secondary links keep `min-h-[44px]`).
- Header over-hero contrast verified; mobile menu remains a no-JS `<details>` disclosure.

---

## Remaining limitations & trade-offs

- **No visual screenshots** captured (no browser in this environment). The reel's width-derivation is verified structurally and uses the same CSS mechanism the prior reel shipped with, but a human eye-pass at 390/768/1440px is still recommended.
- **Wheel hijacking is opinionated.** Vertical wheel scrolls the reel horizontally while the cursor is over it. It's boundary-aware (the page scrolls at the ends), but some users don't expect it. Easy to revert by deleting the wheel `useEffect`.
- **Reel autoplay removed by spec.** The rail no longer self-advertises with motion; its "there's more" cue is now the partial frame at the right edge + the grab cursor. This is the requested trade-off (control over spectacle).
- **`galeries` index still uses bordered cards.** It's an inner navigation page, out of this homepage-focused pass; worth de-carding in a later pass for full consistency with Rule 2.
- **Placeholder notes are full clauses, not the stacked one-word lines** of the brief's example. Chosen for lower content-maintenance; they still read as art direction. Could be switched to `string[]` later if desired.
- **`describeFrame` covers `aspect-[w/h]`, `aspect-square`, `aspect-video`.** Any exotic ratio token without those forms falls back to no caption line (rare; all current frames are covered).

---

## Future content integration plan (zero layout change)

When the photographer delivers real assets:

1. **Hero** — replace `/demo/hero.jpg` (or set `home.hero.image`). Already wired.
2. **Reel** — set `src` + `alt` on entries in `content/galleries.ts → featured` (and optionally `width/height`). Fixed height + aspect ratio mean no reflow.
3. **Emotion spreads** — add `src` (+ dimensions) back to `home.seances.scenes[*]`; the `Scene` type already allows it and every composition (split / full-width / full-bleed) renders the photo automatically.
4. **About portrait** — pass a real `GalleryImage` to `<AboutPreview portrait={…} />` or extend the about content.
5. **Discover** — add `src` to `home.discover.cards[*]` (the `ImageFigure` swaps placeholder → photo in place; caption stays below).
6. **Testimonials** — push real entries into `content/testimonials.ts`; the section flips from reserved state to carousel with no layout change.
7. **Pricing** — set `priceFrom` on packages to surface "à partir de N €"; until then "Tarif sur demande" stands.
8. **Genre galleries** — add `src`/`width`/`height`/`alt` to `content/galleries.ts` entries.

Every one of the above is a **data edit**. No component or layout change is required — which is the architecture's pass/fail test, and it passes.

---

## Honest self-critique

- The **placeholder art-direction notes are drafted by me** in the brand voice. They are evocative but must be confirmed (or rewritten) by the photographer — they currently double as a creative brief, which is useful but not gospel.
- I **demoted the pricing primaries to secondary** to honour "one primary per viewport." That's the right call for restraint, but if conversion data later shows the pricing block needs a stronger nudge, a single shared primary beneath both packages would be the move (not two).
- The **reel loses its ambient autoplay**, which was genuinely attractive. The spec is explicit, and control is the more premium choice, but it's a real subtraction of life from the page — mitigated by the partial-frame overflow cue.
- I **did not touch the `galeries` index cards or the contact-form field borders.** Field borders are functional and fine; the gallery cards are a deliberate scope boundary (homepage-first) and a known follow-up.
- I could not **screenshot**; structural verification is strong but not a substitute for a human eye-pass, especially on the reel's derived widths and the dark full-bleed placeholder's tone.
- The **header legibility scrim duplicates** the hero's own top gradient when both are present. It's intentional belt-and-suspenders (robust over a future bright hero), but it's slightly redundant today.

---

*Implemented on branch `flagship-homepage`. 15 files changed; no new sections, no new dependencies, no config changes.*
