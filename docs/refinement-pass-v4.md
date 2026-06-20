# Refinement Pass v4 — Adamenko Photography homepage

**Date:** 2026-06-20
**Branch:** `flagship-homepage` (not committed — operator review first)
**Goal:** a premium, timeless, editorial homepage that feels complete and desirable
**without a single real photograph.** Photography should amplify the design, never
rescue it.

This pass addresses the three issues called out after v3 — broken vertical rhythm, an
unfinished reel, and an incoherent "destinations" section — plus a header audit and a
global whitespace pass. Priorities were executed in the requested order.

All verification below is from **real screenshots and real browser interaction**
(Playwright driving Chromium against the dev server), not DOM inspection or build
output alone.

---

# Problems Identified

**1. Vertical rhythm was broken (highest priority).**
- The page ran on a *six*-token scale (32/48/72/96/128/160) with role-based section
  padding that alternated big/small. Adjacent "OPEN" sections (`py-40` = 160) stacked
  their padding, so paper→paper gaps reached **288px** before *Quatre émotions* (reel
  `py-32` bottom + séances `py-40` top).
- The footer carried `mt-32` (128) on top of the dark contact band, so on the homepage
  a **128px empty paper void** sat between the contact climax and the footer — they
  read as two separate screens.
- Several values weren't even on the scale (`py-18`=72, `mt-18`=72, `space-y-40`=160),
  so "one system" was not actually true.

**2. The "Pour aller plus loin" destinations trio read as three unrelated cards.**
- The three frames floated at three *different top offsets* (`mt-24`, `mt-12`, none)
  with no shared baseline and captions hanging at three different heights. Nothing tied
  them together; remove the text and it was three loose rectangles, not a composition.
- Bonus defect surfaced once spacing tightened: the add-ons **title** "Pour aller plus
  loin." sat two beats above the trio's **eyebrow** "Pour aller plus loin" — the same
  phrase twice in adjacent sections.

**3. The reel felt unfinished.**
- A "05 / 10" counter and a separate bottom toolbar created visual noise and fragmented
  controls. Arrows lived *below* the wall, disconnected from the frames.
- No infinite loop — it clamped at both ends like an e-commerce slider.

**4. The header felt lightweight / technical.**
- 64px tall, a 16px logo with `tracking-tight` (condensed → "technical"), 12.8px nav
  links at 80% opacity, and **no active-route state** at all.

**5. Whitespace audit.** Confirmed the dead gaps above were the main offenders; checked
every breakpoint for empty-vs-intentional space and horizontal overflow.

---

# Decisions Made

### TASK 1 — One spacing system, denser and continuous
- Collapsed everything to the **five requested tokens**: `XS 24 · S 40 · M 64 · L 96 ·
  XL 128` → Tailwind `6 / 10 / 16 / 24 / 32`. Documented at the top of
  [globals.css](../src/styles/globals.css).
- **Almost every section now runs one rhythm:** `py-10 sm:py-16` (S 40 → M 64). On
  desktop that makes the paper→paper gap a single **128 (XL)** — calm but dense, one
  metronome. The dark contact band is the only exception (`py-16 sm:py-24`, M→L) — the
  emotional climax earns a little weight.
- Heading→content is **S→M** (`mt-10 sm:mt-16`); inter-block (séance scenes) is **M→L**
  (`space-y-16 sm:space-y-24`). Intra-text micro-spacing (eyebrow→title→body, 4–20px)
  is the *type* scale and was deliberately left alone — forcing 24px between an eyebrow
  and its title would wreck editorial typography.
- **Footer top margin removed entirely.** The footer now begins the instant the contact
  band ends; its own hairline is the only divider. Contact + footer read as one closing
  movement. ([site-footer.tsx](../src/components/layout/site-footer.tsx))
- Migrated the inner routes (`/galeries`, `/a-propos`, `/prestations`, `/contact`,
  `/galeries/[genre]`) off the stray `py-18`/`mt-20` onto the same tokens, so the system
  is genuinely single site-wide.

### TASK 2 — The trio became one composition
- Rebuilt [discover-cards.tsx](../src/components/home/discover-cards.tsx) as a **single
  hung row on a shared bottom baseline** (`sm:items-end`). The three frames now *stand on
  the same ground*; their widths (col-span **4 / 3 / 5** — deliberately uneven so it
  never reads as a grid) and aspect ratios (**1:1 / 2:3 / 7:5**) differ so the tops form
  a **skyline that rises to a tall, narrow accent in the centre** and resolves on a wide
  frame at the right. The eye travels left→right across that rise-and-fall.
- Captions hang off the same baseline into one rhythm. A responsive caption reserve
  (`sm:min-h-28 xl:min-h-0`) keeps image-bottoms and caption-tops aligned even when a
  title wraps in a narrow column.
- Renamed the trio eyebrow "Pour aller plus loin" → **"Pour découvrir"** to kill the
  duplicate-phrase defect. *(Flagged — see Intentionally Unchanged / copy note.)*
- No card, border, shadow, or scrim. Remove every word and three masses on one horizon
  with a central peak is still a designed composition.

### TASK 3 — The reel became an endless exhibition wall
[horizontal-gallery.tsx](../src/components/gallery/horizontal-gallery.tsx)
- **Removed** the frame counter and the entire bottom toolbar.
- **Infinite loop:** the list is hung ×3 and the scroll position is silently recentred
  at each copy boundary. The jump is exactly one copy wide onto identical content, so the
  seam never shows — it opens mid-copy and never starts or ends.
- **Arrows overlaid on the wall:** edge-anchored, vertically centred, no background,
  semi-transparent. On pointer devices they're hidden until the wall is hovered, then sit
  translucent and reach full strength only under the cursor. On touch (no hover) they stay
  gently visible. (`.reel-arrow` rules in globals.css.)
- **Kept** drag + inertia, touch, trackpad, keyboard (← / →). **Wheel:** horizontal
  intent scrolls the wall; a plain *vertical* wheel is left to the page so an endless wall
  never traps the scroll.

### TASK 4 — A header that feels expensive on a blank page
[site-header.tsx](../src/components/layout/site-header.tsx)
- Height **64 → 80** on desktop (`h-16 sm:h-20`).
- Logo **16 → 18/20**, dropped `tracking-tight` (the condensed setting read "technical").
- Nav links **12.8 → 14px**, contrast up (inactive `ink/70`, hover `clay`), gaps
  `gap-8 lg:gap-10`.
- **Added an active-route state** (the missing piece): a 1px clay underline +
  `aria-current="page"`, inverted to paper over the dark hero. `/galeries` stays active
  inside a genre.

### TASK 5 — Whitespace
- Verified at 1920 / 1440 / 1024 / 768 / 390 from screenshots; the only remaining large
  spaces are the intentional ones (hero negative space, ultrawide measure gutters).

---

# Why These Decisions Are Better Than Alternatives

- **Uniform `py-10 sm:py-16` vs. keeping role-based big/small padding.** Role-based
  padding is what *caused* the 288px stalls (two big sections stacking). A single rhythm
  makes every transition identical and intentional, and the page reads "dense" without
  feeling cramped — density comes from the consistent 128 beat, not from emptiness. The
  one exception (dark contact band) is justified hierarchy, not an arbitrary value.
- **Footer `mt-0` vs. a smaller margin or a dark footer.** A smaller margin still reads
  as a gap. A dark footer would change every inner page (the footer is global). Removing
  the margin lets the footer's own hairline be the divider — it works on the homepage
  (flows out of the dark band) *and* inner pages (flows out of paper content) with no
  per-route branching.
- **Shared-baseline skyline vs. the old top-offset stagger or a min-height card grid.**
  Top offsets gave three disconnected objects. A tidy equal grid would read as "cards
  again." Standing three uneven masses on one baseline with a central vertical accent is
  a real editorial device — it survives the "remove all text" test and it accepts real
  photographs into the exact frames with zero layout change.
- **Triple-and-recenter infinite loop vs. a library or a transform carousel.** No new
  dependency (a hard constraint), and it rides *native* scroll — so drag, touch momentum,
  trackpad, and wheel all keep working for free. A transform-based carousel would have
  re-implemented (and usually broken) those inputs.
- **Overlay arrows with `@media (hover:hover)` vs. a JS touch check or always-on
  buttons.** Pure CSS, no hydration cost, correct on both pointer and touch, and the
  arrows never compete with the photographs.
- **Vertical wheel left to the page vs. hijacking it.** With an *endless* wall, hijacking
  vertical wheel would trap the page forever. Converting only horizontal intent keeps the
  museum-wall feel ("navigation never competes").

---

# Before / After

| Area | Before | After |
|---|---|---|
| Reel → séances gap | ~288px dead space before *Quatre émotions* | one 128 beat — [before](screenshots/v4-before/desktop-03-sessions.png) · [after](screenshots/v4/desktop-03-sessions.png) |
| Contact → footer | 128px paper void; two screens | footer flows from the dark band — [before](screenshots/v4-before/desktop-05-contact.png) · [after](screenshots/v4/desktop-10-contact-footer.png) |
| Destinations trio | three offset, unrelated cards | one skyline composition — [before](screenshots/v4-before/desktop-04b-discover-trio.png) · [after](screenshots/v4/desktop-09-discover-full.png) |
| Reel controls | counter + bottom toolbar + detached arrows | endless wall, overlay edge chevrons — [after](screenshots/v4/desktop-11-reel-arrows.png) |
| Header | 64px, 16px condensed logo, no active state | 80px, 18/20px logo, active underline — [after](screenshots/v4/desktop-01-hero.png) |
| Whole page | airy, stalling | dense, continuous — [before](screenshots/v4-before/desktop-06-full.png) · [after](screenshots/v4/desktop-06-full.png) |

---

# Breakpoint Validation

**Horizontal overflow — measured, all clean:**

| Width | scrollW vs clientW | Overflow |
|---|---|---|
| 1920 (ultrawide) | 1920 / 1920 | **0px ✓** |
| 1440 (desktop) | 1440 / 1440 | **0px ✓** |
| 1024 (laptop) | 1024 / 1024 | **0px ✓** |
| 768 (tablet) | 768 / 768 | **0px ✓** |
| 390 (mobile) | 390 / 390 | **0px ✓** |

**Discover composition alignment (image-bottom / caption-top spread):**

| Width | Image bottoms | Caption tops |
|---|---|---|
| 1920 / 1440 / 1280 / 1024 | **0px** | **0px** |
| 768 / 660 | **0px** | 17px* |

\*At ≤768 the longest eyebrow ("INFOS PRATIQUES") wraps in the narrowest column,
nudging one caption down 17px. The image baseline — the visual anchor — stays exact.

**Reel interaction (Playwright, both reduced-motion states):**
- Infinite loop forward & backward — recenters, **no clamp, no visible seam ✓**
- Old "/ 10" counter — **removed ✓**
- Drag Δ=450px ✓ · inertia glides in normal, **none under reduced-motion ✓** · no text selected ✓
- Horizontal wheel Δ=300 ✓ · vertical wheel leaves the reel still and scrolls the page ✓
- Keyboard ← / → advances one frame ✓ · focus ring present (2px, inset 3px) ✓
- Arrows: overlaid (`position:absolute`), **no background**, opacity 0 → .55 → 1 on
  desktop (idle → wall-hover → arrow-hover); **0.5 always on touch ✓**

**Build / quality gates:** `tsc --noEmit` ✓ · `eslint .` ✓ · `next build` ✓ (15 static
routes) · **0 console errors, 0 hydration warnings** across a full-page scroll.

---

# Intentionally Unchanged Areas

- **Ultrawide side gutters.** Content stays capped at `max-w-6xl` (1152px); full-bleed
  bands (hero, reel, full-bleed séance) span the screen. The side margins on a 1920
  monitor are an intentional *measure*, not a gap to fill — line length is a premium
  decision.
- **Hero negative space.** The deep air above the low-left caption is the cinematic
  composition, not dead space.
- **Placeholder-first everything.** No demo imagery introduced; every frame is still a
  directed reserved frame that accepts a real photo with zero layout change.
- **Section order, content model, and the warm token palette** — untouched.
- **Marketing copy** remains the careful DRAFT (still pending the photographer's
  confirmation). The **one** copy edit — trio eyebrow "Pour aller plus loin" →
  "Pour découvrir" — is reversible; it exists only to remove the duplicate-phrase
  collision with the add-ons title. Revert one word if the operator prefers the original.
- **No new sections, dependencies, libraries, glassmorphism, shadows, decorative
  gradients, or animations** — per the constraints.

---

# Screenshots

### Desktop (1440)
- Hero / header presence — [desktop-01-hero.png](screenshots/v4/desktop-01-hero.png)
- Reel → séances (the fixed gap) — [desktop-03-sessions.png](screenshots/v4/desktop-03-sessions.png)
- Reel with overlay arrows — [desktop-11-reel-arrows.png](screenshots/v4/desktop-11-reel-arrows.png)
- Destinations composition — [desktop-09-discover-full.png](screenshots/v4/desktop-09-discover-full.png)
- Contact → footer (one movement) — [desktop-10-contact-footer.png](screenshots/v4/desktop-10-contact-footer.png)
- Full page — [desktop-06-full.png](screenshots/v4/desktop-06-full.png)

**Why the spacing now works:** one 128 beat between sections replaces the 160/288 stalls,
so the scroll keeps momentum and nothing reads as a void. **Why the composition is
stronger:** the trio sits on one baseline with a central peak — a designed object, not
three cards. **Why it feels more premium:** the taller header + larger serif logo + active
state, the chrome-free museum reel, and the contact that closes straight into the footer.

### Laptop (1024)
- Full page — [laptop-01-full.png](screenshots/v4/laptop-01-full.png)
- Destinations (perfect alignment) — [discover-1024.png](screenshots/v4/discover-1024.png)

### Tablet (768)
- Full page — [tablet-01-full.png](screenshots/v4/tablet-01-full.png)
- Destinations (image baseline holds, one eyebrow wraps) — [discover-768.png](screenshots/v4/discover-768.png)

### Mobile (390)
- Hero — [mobile-01-hero.png](screenshots/v4/mobile-01-hero.png)
- Reel — [mobile-02-reel.png](screenshots/v4/mobile-02-reel.png)
- Full page — [mobile-04-full.png](screenshots/v4/mobile-04-full.png)

The mobile page is now a single tight, consistent rhythm; the destinations stack cleanly
(the skyline is a desktop idea and degrades to an honest column).

### Ultrawide (1920)
- Hero — [uw-01-hero.png](screenshots/v4/uw-01-hero.png)
- Full page — [uw-02-full.png](screenshots/v4/uw-02-full.png)

---

# Honest Assessment

**1. Where does excess whitespace still remain?**
On **ultrawide**, the constrained content sections leave large left/right gutters while
the full-bleed bands fill the screen — defensible as measure, but it is the most "empty"
the page ever looks. The **section→tinted-band** transitions (pricing→add-ons,
about→experience) are a full 128 — correct per the system, but they're the largest
vertical gaps left, and a stricter pass could tighten the approach *into* a tinted band by
a notch. The **hero** keeps deliberate air above its caption.

**2. Which section is currently the weakest?**
The **add-ons ("Pour aller plus loin.")** — it's a plain six-item text list with clay
ticks. It's clean and honest, but it's the one block with no real composition, so it reads
as the most "template-like." A close second is the **empty testimonials** state: a single
centred line that is intentionally reserved, but it's the thinnest beat on the page.

**3. What will improve most once real photography is added?**
The **full-bleed séance band** (today a warm-black directed frame → becomes a
full-screen photograph, the single biggest visual jump), then the **hero**, the **reel**
(a true exhibition wall), and the **destinations skyline**. The whole page is built so
those swaps are data-only, zero layout change.

**4. Which sections still depend too heavily on content?**
**Testimonials** depends entirely on real quotes that don't exist yet (it's reserved by
choice). The **séances**, **reel**, **about portrait**, **hero**, and **destinations** are
all placeholder-driven — by design they hold up now, but their *emotional* payoff is
gated on real images. Marketing copy across the page is still DRAFT pending the
photographer.

**5. Is this ready for merge?**
**As a design/refinement PR — yes.** Build, lint, and typecheck are green; zero overflow,
zero hydration warnings, zero console errors; every reel interaction, reduced-motion, and
keyboard path is validated. **As a public launch — no, and it shouldn't be:** it still
needs real photography and photographer-confirmed copy (and the contact form wired to
delivery). My recommendation: merge the refinement after the operator okays the single
eyebrow copy change; keep launch gated on real content.

---
---

# v4.1 — "Pour découvrir" rebuilt as an interactive navigation menu

**Scope:** this addendum covers ONLY the "Pour découvrir" section. No other section,
global token, dependency, or typography was touched. It implements the two reference
screenshots (default + hover) supplied by the operator.

## Implementation Notes

- The section is now **three equal destinations** (`lg:grid-cols-3`), each a square media
  area with a centred eyebrow + serif title beneath — replacing the v4 skyline.
- **The whole column is one `<Link>`** (`.discover-item`), not just the title or image.
- **Mechanism (transforms + opacity only, zero CLS):** on `lg` each item is a
  fixed-footprint **2:3 frame** (`lg:aspect-[2/3] lg:overflow-hidden`). The media fills the
  whole frame; a paper **cover panel** (`.discover-cover`, `lg:h-1/3`) hides the bottom
  third and carries the default ink caption — so by default you see *square + caption
  below*. On hover/focus the cover `translateY(100%)` slides off the clipped bottom,
  revealing the full portrait, while a legibility scrim and a **white caption** fade in
  (`.discover-veil` / `.discover-reveal`). The footprint never changes → **no reflow, no
  layout shift** (verified: item box 341×512 before *and* after hover).
- Files: [discover-cards.tsx](../src/components/home/discover-cards.tsx) (markup),
  [globals.css](../src/styles/globals.css) (`--ease-discover` + `.discover-*` rules). The
  component imports nothing new; `ImageFigure`/`cn` were dropped (no longer used).
- Duration **720ms** (transform) / 600ms (opacity), easing **cubic-bezier(0.22, 1, 0.36,
  1)** as specified. `will-change: transform` on the sliding cover.
- One cascade subtlety worth recording: the reveal's resting `opacity: 0` lives on the
  `.discover-veil` **class**, not a Tailwind `opacity-0` utility — utilities sit in a later
  `@layer` and would otherwise beat the `@layer base` hover rule and keep the scrim hidden.

## Interaction Decisions

- **Cover-slide, not image-scale.** "Scale vertically" would stretch/distort a real
  portrait; sliding the paper cover off a full-bleed `object-cover` media reveals the
  image at its true aspect (a crop, never a stretch) and reads as the image *opening
  downward* — exactly the reference, and it survives a real photo dropping in.
- **White caption + functional scrim.** Reference screenshot 2 shows the label/title in
  white on the expanded image, so the caption is duplicated: ink on the cover (default),
  white over the image (hover). Because the placeholder is a *light* field, a bottom
  legibility scrim (the same device the hero/header already use — functional, not
  decorative) is required for the white text to read; it also future-proofs real photos.
- **Caption stays put, recolours.** The white caption sits in the same bottom-third band
  as the ink caption, so the text appears to hold position and turn white as the image
  rises behind it — no jump.
- **Expansion gated to pointer + motion-safe + `lg`.** `@media (hover: hover) and
  (min-width: 64rem) and (prefers-reduced-motion: no-preference)`. Touch never expands
  (no sticky-hover); narrow desktop windows (< lg, where the layout is stacked) never
  expand into a broken state.

## Accessibility Notes

- Each item is a semantic `<a>` (verified `<A> href=/prestations`), keyboard-focusable
  (verified `document.activeElement === item`), with an **`aria-label`** per destination
  (e.g. *"L'expérience : À quoi s'attendre"*). The decorative media + both caption copies
  are `aria-hidden`, so screen readers announce one clean name.
- **Keyboard focus triggers the same "opening"** (gated by motion-safe, any pointer type)
  plus a clear `:focus-visible` outline (2px ink, 4px offset) — keyboard users get
  identical, obvious feedback. See `menu-1440-focus.png`.
- **Reduced motion:** expansion is fully disabled (the `no-preference` guard). As a
  motion-free affordance the title warms to **clay** on hover so the item still reads as
  interactive. See `menu-1440-reduced-hover.png`.

## Breakpoint Validation

Measured against the running app (screenshots + computed styles):

| Width | Layout | Behaviour | Overflow |
|---|---|---|---|
| 1920 | 3-up | hover expansion ✓ | 0px ✓ |
| 1440 | 3-up | hover + focus expansion ✓ | 0px ✓ |
| 1024 | 3-up | hover expansion ✓ | 0px ✓ |
| 768 (touch) | stacked, static | no expansion, caption always visible ✓ | 0px ✓ |
| 390 (touch) | stacked, static | no expansion, caption always visible ✓ | 0px ✓ |

- **CLS:** item footprint **341×512 before and after hover** → no shift.
- **Console / hydration:** 0 errors, 0 warnings, 0 hydration mismatches.
- **Build / lint / typecheck:** all green (`next build` → 15 static routes).
- Computed-style probe on hover: `:hover` true, both reveal layers `opacity: 1`, cover
  `translateY(170px)`.

## Before / After Screenshots

- **Before (v4 skyline):** [discover full](screenshots/v4/desktop-09-discover-full.png)
- **After — default (matches reference 1):** [menu-1440-default.png](screenshots/v4-menu/menu-1440-default.png)
- **After — hover (matches reference 2):** [menu-1440-hover.png](screenshots/v4-menu/menu-1440-hover.png)
- **After — keyboard focus:** [menu-1440-focus.png](screenshots/v4-menu/menu-1440-focus.png)
- **After — reduced motion (static + clay title):** [menu-1440-reduced-hover.png](screenshots/v4-menu/menu-1440-reduced-hover.png)
- **After — ultrawide / laptop hover:** [menu-1920-hover.png](screenshots/v4-menu/menu-1920-hover.png) · [menu-1024-hover.png](screenshots/v4-menu/menu-1024-hover.png)
- **After — tablet / mobile (stacked, static):** [menu-768-tablet.png](screenshots/v4-menu/menu-768-tablet.png) · [menu-390-mobile.png](screenshots/v4-menu/menu-390-mobile.png)

**How closely it matches the references:** default state is a near-1:1 match (three equal
squares, centred eyebrow + large serif title). Hover is a faithful match — the image
expands downward, consumes the caption area, and the label/title reappear in white over
the image. The single honest difference: the references use real B&W photographs, so we
substitute the directed warm-gradient placeholder; the *interaction, composition, and
caption behaviour* are reproduced exactly, and a real photo drops into the same frame
with no change.

## Remaining Limitations

- **Tablet (≤1023) stacks.** Evaluated per the brief: 3 columns can't hold the longer
  French titles at tablet widths without cramping, so it stacks to one column. The
  trade-off is tall full-width squares on a portrait tablet — readable and immersive, but
  a long scroll for three items. A future option is a 2-up tablet layout, but 3 items
  divide awkwardly into 2 columns.
- **Placeholder white-on-light.** The hover caption relies on the legibility scrim to read
  over the *light* placeholder; with a bright real photograph the scrim still carries it,
  but very high-key images may want a slightly stronger scrim — trivial to tune per image.
- **Caption duplicated in the DOM** (ink + white) for the cross-state effect; both are
  `aria-hidden` with the accessible name on the link, so there's no a11y cost, only two
  extra spans.
- Copy is still the v4 draft (eyebrow "Pour découvrir"); unchanged here.
