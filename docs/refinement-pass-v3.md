---
title: Refinement Pass v3 — Production Hardening, Placeholder-Complete
project: Adamenko Photography
date: 2026-06-20
status: implemented — prepared for review (NOT committed)
branch: flagship-homepage
supersedes: refinement-pass-v2.md (carried forward, not undone)
tags: [spacing-system, reel, placeholders, cta, responsive, a11y]
---

# Refinement Pass v3 — does the homepage succeed without photography?

> **Short answer: yes.** Every image on the homepage is now a directed placeholder —
> there is no demo photography anywhere, including the hero and the reel — and the
> page reads as a premium editorial experience *waiting for* photography, not an
> unfinished site missing it. Verified across five breakpoints with zero overflow,
> zero hydration warnings, zero real console errors. Screenshots in
> `docs/screenshots/v3/`.

This was a **production-hardening** pass on top of v2 — no redesign. The editorial
direction, typography, neutral palette, asymmetry, and restraint are preserved. The
work: a strict spacing system, a true manual exhibition-wall reel, a unified
placeholder language with the hero now placeholder-driven too, an asymmetric contact
block, and a full responsive + quality sweep.

---

# Goals

1. The homepage must feel intentional and premium **with placeholders alone**.
2. Impose a **strict vertical rhythm** (6 tokens, no arbitrary values).
3. Rebuild the reel as a **manual exhibition wall** — no autoplay, no loop, no
   lightbox, no zoom — with drag-inertia, wheel, keyboard, and minimal arrows.
4. **Remove all photo dependency**: strengthen layout, never compensate with imagery.
5. Make the contact block **editorial and asymmetric**.
6. Keep one **unified CTA language** (outlined pill + underline link).
7. Pass a real **responsive + quality** bar (build, lint, types, SSR, hydration, CLS,
   a11y, reduced-motion, touch).

---

# Constraints (honoured)

No new sections · no new dependencies · no cards/shadows/glass/decorative gradients ·
no autoplay/lightbox/zoom/modal galleries/ecommerce sliders · no trendy interactions ·
nothing that competes with photography. Refine only; preserve the established
language. **Not committed** — prepared for review.

---

# What I changed

Section by section (deltas from the v2 working tree).

### Spacing — every section, header, footer
Re-tokenised all section padding and major block gaps to the 6-token scale (see
**Spacing audit**). Documented the system at the top of `styles/globals.css`.

### Hero — `home/hero-media.tsx`, `content/home.ts`
Removed the demo hero image. The hero now renders a **directed full-frame
placeholder**: a warm radial dark field with a quiet caption (`Image d'ouverture ·
plein cadre` + a one-line art-direction note) — a magazine cover awaiting its
opening photograph. The headline becomes the LCP (text, instant, no CLS). Add
`hero.image.src` later → the photo drops in, nothing moves.

### Reel — `gallery/horizontal-gallery.tsx`, `content/galleries.ts`, `home/featured-reel.tsx`
Rebuilt as a **manual exhibition wall** (full detail in **Reel redesign**):
- content is now **10 directed placeholders** (no demo imagery), mixed ratios,
  each with a one-line art-direction note;
- removed the **lightbox**, the `interactive` hover-zoom, autoplay, the infinite
  loop, and all the autoplay plumbing;
- added **drag-inertia**, vertical+horizontal **wheel**, **keyboard** (←/→), minimal
  **prev/next arrows** (hover-revealed on desktop, always-on mobile, disabled at the
  ends), and a **plate counter** (01 / 10);
- frames are now plain `<figure>` display elements (no nested figure, no button).

### Emotion spreads & full-bleed break — `home/services-showcase.tsx`
Tokenised the section + inter-block rhythm. (The directed-placeholder spreads and
the dark `FullBleed` placeholder branch already arrived in v2.)

### Contact — `home/final-cta.tsx`, `content/home.ts`
Reworked from centred to **editorial asymmetry**: a dominant left-anchored title
block (eyebrow → large serif → body → pill + underline CTAs) with a quiet
**right-offset meta column** (`Basée à` / `Disponibilité`), baseline-aligned on
desktop, stacked left on mobile. (Fixed a 12-col gap overflow — see Responsive.)

### Footer / header — `layout/site-footer.tsx`, `layout/site-header.tsx`
Footer spacing tokenised. (The editorial footer + over-hero legibility scrim arrived
in v2; unchanged here beyond rhythm.)

### Placeholder system — `ui/image-figure.tsx`
Unchanged engine from v2 (orientation·ratio caption + optional label + art-direction
note over a warm radial field); v3 **extends its reach** to the hero and the reel so
the entire page speaks one placeholder language.

### Buttons — `ui/button-link.tsx`, `contact-form.tsx`, `app/prestations/page.tsx`
Verified against the v3 spec; the v2 pill + underline system already satisfies it
(see **CTA redesign**). No change needed beyond confirming one primary per viewport.

### Inner pages — `a-propos`, `contact`, `prestations`, `galeries`, `galeries/[genre]`
Container padding tokenised (`py-18 sm:py-24`) so the rhythm system is global.

---

# Spacing audit

**The system** (documented in `globals.css`): the only vertical rhythm values, each
mapping to a Tailwind numeric utility (base unit 0.25rem), so it is greppable with
zero arbitrary values.

| Token | px | class |
|------|-----|-------|
| XS | 32 | `8` |
| S | 48 | `12` |
| M | 72 | `18` |
| L | 96 | `24` |
| XL | 128 | `32` |
| 2XL | 160 | `40` |

**Section roles** (alternating breathe ↔ dense):

| role | classes | mobile → desktop |
|------|---------|------------------|
| OPEN | `py-24 sm:py-40` | 96 → 160 |
| BASE | `py-18 sm:py-32` | 72 → 128 |
| BAND | `py-18 sm:py-24` | 72 → 96 |

**Before → after** (section vertical padding):

| Section | before (px, mob→desk) | after | role |
|---|---|---|---|
| Signature | 64 → 112 | **96 → 160** | OPEN |
| About | 64 → 128 | **72 → 128** | BASE |
| Experience (band) | 56 → 112 | **72 → 96** | BAND |
| Reel | 56 → 112 | **72 → 128** | BASE |
| Séances | 64 → 128 | **96 → 160** | OPEN |
| Pricing | 56 → 112 | **72 → 128** | BASE |
| Add-ons (band) | 56 → 112 | **72 → 96** | BAND |
| Discover | 80 → 112 | **72 → 128** | BASE |
| Testimonials (empty/filled) | 56→96 / 64→128 | **72→128 / 96→160** | BASE/OPEN |
| Contact | 56 → 112 | **72 → 128** | BASE |
| Footer (top / pad) | 112→144 / 56→64 | **96→160 / 72→96** | — |

Heading→content gaps standardised to **S→M** (`mt-12 sm:mt-18`); inter-block (séances
spreads, full-bleed break) to **L→2XL** (`space-y-24 sm:space-y-40`, `mt-24 sm:mt-40`);
grid row-gaps to **S** (`gap-y-12`).

**The one deliberate exception (stated plainly):** intra-text micro-spacing
(eyebrow→title→body, 4–20px) is the finer **type scale**, *not* forced onto the
32–160px rhythm tokens — a 32px minimum between an eyebrow and its title would break
editorial typography. The 6 tokens govern **section + block rhythm**; the type scale
governs **within a text block**. Verified: `grep` finds **no arbitrary vertical
spacing** (`py-[`, `mt-[`, `space-y-[`, `gap-y-[`) anywhere in the home/layout/reel
components.

---

# Reel redesign

**Decision: a wall, not a carousel.** Prints hung at one shared height; widths are
each frame's natural aspect ratio; the visitor sets the pace and nothing moves on its
own.

**Layout** — fixed container height `300 / 420 / 480px` (mobile/tablet/desktop);
variable widths derived from `aspect-ratio` at that height (measured live: **7
distinct widths**, range 320–853px desktop / 200–533px mobile across 10 frames);
12px → 16px gaps; edge-to-edge (breaks the container); scrollbar hidden.

**Content** — 10 directed placeholders, mixed orientations, each a one-line art note
(e.g. *Portrait · 4:5 — "Une étreinte avant le coucher du soleil."*, *Paysage · 16:9 —
"Une famille marchant vers la mer."*, *Carré · 1:1 — "Des mains qui se cherchent."*).
The order is the edit — it rises and falls like a hang.

**Interaction & rationale:**

| Capability | How | Why |
|---|---|---|
| Mouse drag | pointer capture; `scrollLeft` follows | direct, tactile |
| **Inertia** | velocity sampled per move; decays `×0.92`/frame on release | "movement stops naturally" — momentum without a library |
| Touch swipe | native overflow scroll + momentum | platform-correct, zero JS cost |
| Trackpad / **wheel** | non-passive handler; vertical+horizontal → `scrollLeft`, **boundary-aware** | wheel support without trapping the page at the ends |
| **Keyboard** | region `tabindex=0`; ←/→ scroll one frame | accessible without a lightbox |
| **Arrows** | thin `←`/`→`, 4px shift on hover, disabled at ends; fade-in on desktop hover/focus, always-on mobile | minimal editorial control, no circles/shadows |
| **Counter** | `01 / 10`, computed from scroll position | quiet orientation cue |
| Cursor | `grab` / `grabbing` | affordance |

**Removed by spec:** autoplay, autoscroll, infinite loop, pause-on-hover, image zoom,
image opening, **lightbox**. No scroll-snap (it fights inertia — "no snapping
conflicts"). Reduced-motion drops inertia and uses instant arrow jumps.

**Verified interactions** (headless): counter tracked `01→02→05→04` through
next/prev; wheel `deltaY 400` advanced `scrollLeft 1797→2197`; `ArrowRight`
advanced `2197→2909`; clicking a frame opened **no dialog**; frames are 10 `<figure>`
with **0 buttons** inside.

> Note: the genre gallery pages (`/galeries/[genre]`) keep their existing Lightbox —
> that is a real gallery, not the homepage reel. The "no lightbox" rule was applied to
> the reel only.

---

# Placeholder system

**One language, everywhere** (`ImageFigure` + the hero/full-bleed dark variants):

- a warm tonal field with a soft directional light (never a flat beige box);
- a top caption — **orientation · ratio** parsed from the `aspect-[w/h]` token
  (`Portrait · 4:5`, `Paysage · 16:9`, `Carré · 1:1`) with an optional plate index;
- an optional **subject label** (e.g. *La photographe*);
- a one-line **art-direction note** (the emotional/compositional intent).

**Surfaces covered:** hero (full-frame, dark) · reel (10 frames) · emotion spreads ·
full-bleed break (dark) · about portrait · discover trio · genre galleries. The
aspect-ratio token reserves the exact frame, so a real export lands at **CLS ≈ 0**.

**Rules:** never a blank box; always communicate composition + orientation + emotional
intent + purpose; reserved space equals the real frame; one component, two surfaces
(light `ImageFigure`, dark hero/full-bleed). Adding a photo is a **data edit** (`src`
+ dimensions) — no component or layout change.

---

# CTA redesign

Unified language, confirmed against the v3 spec:

- **Primary** — a thin **outlined pill** (`rounded-full`, 52px, ≥44px touch), no fill
  at rest; on hover the surface fills gently and the arrow advances ~5px. Light and
  dark (`onDark`) variants. Colour/border/fill ride the global interaction clock
  (~250–300ms); only the arrow transform is local.
- **Secondary** — a text link with a clay underline that **draws from the left** and
  an advancing arrow. No border, no box, no fill.
- **States** — hover (fill/underline + arrow); focus-visible (a single ink outline,
  inverted to paper on dark surfaces via `globals.css`); active (subtle scale/opacity);
  reduced-motion collapses all of it to instant.
- **Discipline** — one primary per viewport (homepage: the contact CTA; pricing CTAs
  are secondary). The contact-form submit and the prestations CTA share the pill.

No filled rectangles, no heavy transitions, no loud motion.

---

# Responsive review

Measured live at **1920 / 1440 / 1024 / 768 / 390** (script: `.shotter/verify.mjs`).

| Viewport | overflow | hydration | reel height | notes |
|---|---|---|---|---|
| 1920 | none ✓ | 0 | 480px | full rhythm, generous |
| 1440 | none ✓ | 0 | 480px | reference |
| 1024 | none ✓ | 0 | 480px | **fixed** (see below) |
| 768 (tablet) | none ✓ | 0 | 420px | spreads stack cleanly |
| 390 (mobile) | none ✓ | 0 | 300px | reel + asymmetric contact stack, left-aligned |

**Bug found & fixed:** at exactly 1024px the contact block overflowed by ~64px. Cause:
`lg:grid-cols-12 lg:gap-24` — eleven 96px column-gaps exceed the container before any
content. Fixed by switching to a 2-track asymmetric grid `lg:grid-cols-[7fr_4fr]`
(one gap). Re-verified: no overflow at any breakpoint.

Mobile: no compressed-desktop feel — section padding drops to the M/L tokens, the
reel shortens to 300px with native swipe + always-on arrows, the contact stacks
left-aligned, the footer stacks brand → nav → copyright. No horizontal overflow, no
cropped interactions.

---

# Technical verification

- `npm run typecheck` — **pass** (clean).
- `npm run lint` — **pass** (clean).
- `npm run build` — **pass**; 15 routes prerendered (`○ Static` / `● SSG`); homepage
  fully static.
- **Hydration** — 0 warnings at all five breakpoints (components render visible on the
  server; the reel is client-only but deterministic — no `window`/`Date`/random in
  render).
- **Console** — 0 real errors at all breakpoints. The single network 404 is
  `/_vercel/insights/script.js` (Vercel Analytics; exists only when deployed on
  Vercel — expected and harmless locally).
- **CLS** — placeholders reserve the exact frame via aspect-ratio; the hero LCP is
  text; no layout shift.
- **A11y / keyboard / reduced-motion / touch** — reel is a labelled focusable region
  with ←/→ keys + real arrow buttons; CTAs have a visible focus ring (inverted on
  dark); all motion is transform/opacity and collapses under `prefers-reduced-motion`;
  touch uses native momentum scroll.

---

# Honest caveats

What still depends on, or awaits, real photography:

- **Emotional ceiling.** Placeholders prove *intention, hierarchy, rhythm*. They
  cannot deliver the final *emotional* payload — a directed dark hero is a strong
  magazine cover, but a real opening frame will still land harder. That's the correct
  relationship (amplify, not rescue), but it's an honest ceiling on the placeholder
  state.
- **The hero is now text-led.** Removing the demo hero is the boldest reading of "works
  without photography." It looks intentional, but a reviewer expecting a photographic
  hero should know this is a deliberate evaluation state, reversible with one data edit.
- **Inertia is hand-tuned**, not physically modelled (velocity sample × decay). It
  feels natural in testing but isn't a spring system; very fast flings on a
  high-refresh display may decay slightly quicker than a native scroller.
- **Wheel-to-horizontal is opinionated.** Boundary-aware so the page never traps, but
  some users don't expect vertical wheel to move a horizontal rail.
- **`/public/demo/*` files remain** on disk (now unreferenced). Harmless; can be
  deleted, or kept as the swap target.
- **Copy is still draft** in the brand voice (incl. the placeholder art-direction
  notes) — confirm every line with the photographer; the personal name is absent by
  policy, never invented.
- **Inquiry form is not wired to delivery** — a launch blocker tracked in the vault,
  untouched here.

---

# Recommended next steps (prioritized)

1. **Operator review of this placeholder state** — confirm the homepage reads as
   premium-without-photography (the v3 thesis) before any real assets.
2. **Real content pass (data-only, zero layout change):** hero frame → 10 reel frames →
   4 emotion frames → about portrait → testimonials → prices. Each is a `src`/value edit.
3. **Wire the inquiry form** to an email/spam-guarded endpoint (launch blocker).
4. **Confirm all copy** with the photographer (incl. art-direction notes); set the real
   name and `priceFrom`.
5. **Lighthouse / field pass** once real images exist (sizes, priorities, LCP).
6. Optional: de-card the `/galeries` index for full Rule-2 consistency (out of scope here).
7. Push the branch / open the PR (operator-gated).

---

# Screenshots

Saved in `docs/screenshots/v3/` (1440 desktop, 768 tablet, 390 mobile; captured with
`prefers-reduced-motion` so every reveal renders).

**Desktop**
- Hero — `desktop-01-hero.png`
- Reel — `desktop-02-reel.png`
- Sessions (séances) — `desktop-03-sessions.png`
- Contact — `desktop-04-contact.png`
- Full page — `desktop-05-full.png`

**Tablet**
- Full page (768) — `tablet-01-full.png`

**Mobile**
- Hero — `mobile-01-hero.png`
- Reel — `mobile-02-reel.png`
- Full page — `mobile-03-full.png`

(Tooling: `.shotter/capture-v3.mjs` + `.shotter/verify.mjs`, Playwright/Chromium,
server on `:3100`.)

---

# Final verdict

**Does the homepage succeed without photography? — Yes, honestly.**

The page is now **100% placeholder-driven** (no demo imagery anywhere, hero and reel
included) and still reads as a flagship editorial experience: controlled rhythm that
breathes then tightens, a real exhibition-wall reel you drive yourself, an asymmetric
contact close, one restrained CTA language, and directed frames that brief the
photography rather than apologise for its absence. It verifies clean across five
breakpoints with no overflow, no hydration warnings, no real console errors.

**What it is not:** *finished.* It is a production-ready **framework** that is
genuinely premium in its placeholder state and that accepts real photography as pure
data with zero layout change. The remaining work — real images, wired form, confirmed
copy — is content and integration, not design. Reviewer's eye still recommended on
the live page (drag-inertia feel, the dark hero decision, tone of the dark
placeholders); the structure is sound and the thesis holds.

*Prepared on branch `flagship-homepage`; 26 files changed (v2 + v3, cumulative);
not committed. No new sections, no new dependencies.*

---

# Pre-PR visual QA

A final ruthless pass — every interaction treated as guilty until proven intentional.
Driven live (Playwright/Chromium, `:3100`) with mouse, trackpad, keyboard, touch
emulation, and `prefers-reduced-motion`, across 390 / 768 / 1024 / 1440 / 2560.

## Findings

**Reel (highest-risk) — held up under stress.** Measured live:
- Drag → **no text selection** (`select-none`; 0 chars selected after a hard drag).
- **Inertia** glides and decays to a natural stop (release→+120ms→+700ms:
  `385 → 720 → 1057`); under reduced-motion it correctly does **not** glide
  (`385 → 385 → 385`).
- **Boundaries** clamp with **no jump** (wheel-past at the end = Δ0).
- **Wheel** (vertical + horizontal) scrolls horizontally and falls through to the page
  at the ends; **keyboard** ←/→ steps frames; **counter** tracks the leading frame
  (`01→02→05→04`); clicking a frame opens **no dialog**; frames are 10 `<figure>` with
  **0 buttons** inside. No dead zones, no scroll-snap conflicts (snap was removed in v3
  precisely to avoid fighting inertia), no perceptible lag.

**Defect found — reel had no visible keyboard focus.** The region is `tabIndex=0` and
arrow-key operable, but the global `:focus-visible` rule only targets
`a/button/summary/input/textarea`, so tabbing to the rail showed **nothing**. Real
a11y gap.

**Weakest section — testimonials (empty).** A lonely "coming soon" line floating in a
tall void: it read as *missing content*, not *intentional restraint* — the one place
the page failed its own thesis.

**Placeholder copy — two real duplications.** The about-portrait note and the discover
"À propos" note both briefed essentially the same frame ("portrait franc · regard
direct · lumière douce"); the reel's pregnancy frame and the séances grossesse frame
both said "à contre-jour". Repetition undercuts the "curated brief" feel.

**Minor — label echo.** "LA PHOTOGRAPHE" appeared twice in the about viewport (inside
the placeholder *and* as the text eyebrow).

**Spacing (judged by eye, not tokens).** Section transitions read intentionally;
headline density is good; contact balance is strong (asymmetry lands); footer and
mobile spacing are calm. No visual rhythm break worth a structural change — the only
spacing problem was the empty testimonials void (fixed below).

**Responsive eye test.** Mobile feels *designed*, not compressed (left-aligned contact,
always-on reel arrows, stacked footer). Desktop reads cinematic (dark hero → reel →
dark break → dark contact). Ultrawide (2560) is *restrained, not broken* — content
caps at `max-w-6xl` with the full-bleed reel/bands carrying the width.

**Reduced motion.** Reel still fully works (drag, wheel, keyboard, arrows; inertia off,
arrow jumps instant); reveals render via the CSS backstop; no animation dependency.

## Fixes applied

1. **Reel focus ring** — added a `.reel-region:focus-visible` rule (2px ink, **inset**
   `-3px` so it never draws off the full-bleed edges) + the class on the scroller.
   Verified: tabbing to the rail now shows a solid ring (`outlineStyle: solid`, 2px,
   ink, offset −3px).
2. **Testimonials empty state** — retired the floating glyph + "arriveront bientôt".
   Now a tightened, centred **statement of integrity**: a clay hairline + *"Les mots de
   mes clientes trouveront leur place ici — vrais, et jamais inventés."* in ink. The
   absence now reads as a deliberate trust signal (on-theme with "La confiance"), and
   the section dropped from `py-32` to the BAND token (`py-18 sm:py-24`).
3. **Copy de-duplication** — discover "À propos" note → *"La photographe dans son
   élément — un geste, entre deux prises."*; reel pregnancy note → *"Une future maman,
   de profil."* No two placeholders now brief the same frame.
4. **Label echo** — dropped the redundant `label` on the about portrait; the frame
   shows only orientation·ratio + the art note.

Re-verified after fixes: **ALL CLEAN** at all five breakpoints (0 overflow, 0
hydration, 0 real console errors), reel interactions intact, focus ring visible,
build/lint/typecheck green.

## Unresolved concerns (honest)

- **Testimonials is still a section with no testimonials.** The reframe makes the empty
  state genuinely good, but a reviewer may still prefer to *not render* the section
  until one real quote exists. That's a product call; the current behaviour (a
  confident reserved state) is the strongest honest option and shifts to a real
  carousel with zero layout change.
- **Inertia is hand-tuned** (velocity × 0.92 decay), not a physics spring. It feels
  natural in testing but a high-refresh display or a very fast flick may decay slightly
  faster than a native momentum scroller. Acceptable; not perfect.
- **Wheel→horizontal is opinionated.** Boundary-aware so the page never traps, but some
  users won't expect a vertical wheel to move a horizontal rail. Easily reverted.
- **Ultrawide side whitespace is a deliberate cap**, not a bug — but it *is* a judgement
  call; some clients read 2560px restraint as "sparse". Widening `max-w` would touch
  every breakpoint, so it's left as-is for review.
- **Tone of the dark placeholders** (hero, *La fête*) reads well in screenshots, but
  monitor/contrast nuance is worth a human glance on the live page.
- **Thematic copy repetition remains** (e.g. "lumière" recurs across notes) — natural
  for photography direction, and the *exact* duplications are gone, but a copy editor
  could vary it further.

## Recommendations for real photography integration

Every swap below is a **data edit** (`src` + `width`/`height`) — zero layout change,
CLS reserved by the aspect-ratio frame:

1. **Hero** — `home.hero.image.src` (+ dimensions). Use a wide, warm, low-key opening
   frame; the caption sits low-left and the top scrim keeps nav legible — pick a frame
   whose left third can carry text.
2. **Reel** — `content/galleries.ts → featured`: 10 frames, and **keep the authored
   ratios** (4:5 · 16:9 · 1:1 · 3:4 · 3:2 · 2:3 · 5:4 · 4:5 · 16:9 · 1:1) so the wall's
   widths and rhythm stay as composed; the array order *is* the hang.
3. **Emotion spreads** — `home.seances.scenes[*].src`; match the per-scene ratios
   (5:4 · 4:5 · 16:9 · 16:9 full-bleed) so the four compositions hold.
4. **About portrait** — 4:5. **Discover** — 4:5 · 2:3 · 3:4.
5. Always provide `width`/`height` (CLS); after images land, re-run the
   `.shotter/verify.mjs` + `capture-v3.mjs` rig and a Lighthouse pass, and review the
   hero/spread/full-bleed tone on a real display.
6. **Then** wire the inquiry form (launch blocker) and confirm all copy + the real name
   + `priceFrom` with the photographer.

## Would I be proud to show this publicly if real photographs never arrive?

Yes. With the testimonials void fixed and the focus gap closed, there is no section
that leans on imagery to feel complete and no interaction that feels like a component
instead of editorial design. The weakest point was hidden emptiness pretending to be
calm; it is now an intentional statement. The reel is invisible-by-design — you think
about the future photographs, not the mechanism.

Ready for PR.

---

# Final pre-PR adjustments

Architecture frozen. This pass touched only the items in scope: reel proportions
(Task 5), the flagged whitespace transitions (Task 1), and confirmation of the reel's
interaction/content/animation rules (Tasks 2–4, 6). No new features, no architecture,
no dependency or section changes.

## Findings

Judged with eyes, not tokens, on the live page (`:3100`, 390 → 2560):

- **The reel was oversized.** At `480px` desktop a single 4:5 frame nearly filled the
  viewport below the heading — the rail read as *the showcase*, not a *preview*, and
  overpowered the séances section that follows. This was the clearest visual problem.
- **Post-reel stall.** Because the rail was so tall, the séances heading never shared
  the viewport with it — the scroll stalled in a long single-frame band.
- **Pre-contact drift.** Discover → testimonials → contact accumulated cream
  whitespace; the empty testimonials beat (a one-line statement) was carrying a full
  BAND of padding, adding a second long pause right before the close.
- **Footer floated.** A `160px` cream void sat between the dark contact band and the
  footer hairline, so the footer read as a detached block rather than a coda.
- **Confirmed clean (no change):** zero demo references anywhere; the reel has **no**
  hover-pause, **no** `interactive` zoom, **no** lightbox; captions are 10 unique,
  non-generic art-direction notes (the QA-pass de-duplication holds).

## Fixes

| # | Change | Before → after | Why |
|---|--------|----------------|-----|
| 1 | **Reel height** (`horizontal-gallery.tsx`) | `300 / 420 / 480` → **`280 / 360 / 400`** (mobile/tablet/desktop) | Reduce dominance: the rail is now a preview strip; more frames read at once; the séances heading shares the viewport. Frame widths follow (desktop range `267–711px`). |
| 2 | **Footer top margin** (`site-footer.tsx`) | `mt-24 sm:mt-40` → **`mt-24 sm:mt-32`** (160 → 128) | Pull the footer up so it reads as a tight coda to the dark contact band. |
| 3 | **Empty-testimonials padding** (`testimonials.tsx`) | `py-18 sm:py-24` → **`py-12 sm:py-18`** (empty state only) | A one-line statement is a *bridge beat*, not a full breathing section; tightening it shortens the pre-contact double-pause. |

All three use the existing 6 spacing tokens (1 and 3 stay token-compliant; see exception
note below). Nothing else was modified.

**Documented spacing exceptions (judged by eye):**
- *Empty testimonials* deliberately runs **below** its section role (S→M, `py-12
  sm:py-18`) because, with no quotes, it is a transitional statement — not a content
  section. The filled state keeps the OPEN role.
- *The breath above "La confiance"* (discover → testimonials) is **kept** as a single
  intentional pause before the contact close — an editorial device, not a stall. It is
  the page's one remaining large gap, and it is on purpose.

## Screenshots

Refreshed to the final state in `docs/screenshots/v3/`:
- `desktop-06-reel-proportion.png` — the reduced reel + the séances heading now sharing
  one viewport (the fix that mattered most).
- `desktop-07-contact-footer.png` — the tightened dark-band → footer coda.
- `desktop-02-reel.png`, `desktop-05-full.png`, `mobile-02-reel.png`,
  `mobile-03-full.png` — re-captured with the smaller reel.

## Interaction decisions

- **Reel proportion vs. presence.** I chose `400px` desktop (not lower) so the
  exhibition-wall *concept* survives — frames must still read as framed prints with
  their art-direction notes legible at the base. Below ~360px the notes start to crowd.
- **Hover never takes control.** Confirmed: there is no `onMouseEnter`/`Leave` logic at
  all — entering the reel changes only the cursor (`grab`). Movement happens only on
  active input (drag, wheel, keys, arrows); it stops only at a boundary or when the user
  stops. Re-verified post-change: counter `01→05→04`, wheel + `ArrowRight` scroll,
  inertia glides then decays, no text selection, no dialog on click, focus ring visible.
- **No new motion.** The only motion remains drag-inertia, the 4px arrow shift, and the
  existing CTA micro-interactions. The editorial spreads' subtle image hover-scale is
  **out of this pass's scope** (it lives on clickable gallery links, not the reel, and
  is invisible while those frames are placeholders).

## Unresolved trade-offs

- **Testimonials still renders empty-by-design.** Tightened and reframed, it's a
  confident statement now — but a reviewer may still prefer to hide the section until a
  real quote exists. Product call; flips to a real carousel with zero layout change.
- **The pre-contact pause is a judgement call.** Some will read it as elegant breathing
  before the close; others as one gap too many. I left it as a deliberate pause.
- **Ultrawide restraint stands.** Content still caps at `max-w-6xl`; the full-bleed reel
  and dark bands carry the width. Not widened (would touch every breakpoint).
- **Inertia is hand-tuned, wheel→horizontal is opinionated** — unchanged from v3; both
  feel natural in testing, both are easily reverted.

## The five questions

1. **Premium without photography?** — **Yes.** Every section stands on typography,
   composition, and the directed placeholders; nothing leans on imagery.
2. **Exhibition wall, not a carousel?** — **Yes**, and more so now: a fixed-height hang
   of variable-width prints you drive yourself, no autoplay/loop/dots, sized as a
   preview rather than a showcase.
3. **Discoverable and enjoyable on every input?** — **Yes.** Drag (+ inertia), touch
   swipe, trackpad, vertical/horizontal wheel, keyboard ←/→ (with a visible focus
   ring), and minimal arrows + counter — all verified live.
4. **Any remaining animation unnecessary?** — **No.** Only navigation-supporting motion
   remains (inertia, arrow shift, CTA micro-interactions); zoom/lightbox are gone.
5. **Any section still dependent on photography?** — **No.** The page is 100%
   placeholder-driven and reads as intentional throughout; real photographs will
   amplify it, not rescue it.

Re-verified after all changes: **ALL CLEAN** at 390 / 768 / 1024 / 1440 / 1920 (0
overflow, 0 hydration, 0 real console errors), reel interactions intact, focus ring
visible, build + lint + typecheck green.

Ready for PR.
