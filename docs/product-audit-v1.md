# Product Audit v1 — Adamenko Photography

**Date:** 2026-06-20
**Branch audited:** `flagship-homepage` @ `454198c` (working tree clean)
**Auditor role:** product designer · UX auditor · design-system architect · frontend reviewer · technical lead
**Method:** full read of `src/` (every route, component, content file, lib, style), production build, typecheck, lint, and static analysis. Every finding below cites a file (and line where useful). No claim is made without evidence.

> **Scope note.** This is an audit, not an implementation. No code was changed. The homepage is the approved benchmark and is treated as the source of truth, not a redesign target.

---

## 0. Sprint 1 status update (2026-06-20) — launch blockers addressed in code

> A focused implementation sprint executed against this audit. Full detail, env vars, deployment checklist, and the owner's manual steps live in **[launch-blockers-v1.md](./launch-blockers-v1.md)**. Verified: `tsc --noEmit` clean, `eslint` clean, `next build` green (20 routes), runtime smoke tests pass (all routes 200; JSON-LD, OG/Twitter, hreflang emitted; contact API returns 200/422/400/503 as designed).

| Audit finding | Sprint outcome |
|---|---|
| C-1 Contact form inert | ✅ **Resolved in code** — Route Handler (`/api/contact`) + Resend REST + honeypot + server validation + loading/success/error states + fallback channel. Needs env vars (owner). |
| H-1 No legal pages | ✅ **Resolved in code** — `/mentions-legales` + `/confidentialite` (RGPD integrated), footer-linked, design-system consistent. Needs business details (owner `TODO`s). |
| H-2 No structured data | ✅ **Resolved** — site-wide `LocalBusiness`/`ProfessionalService` JSON-LD from the identity model. |
| H-3 Body contrast | ✅ **Resolved** — `--color-muted` `#8c8178 → #6f655c` (~5.2:1 on paper, ~4.8:1 on band). |
| H-4 `NEXT_PUBLIC_SITE_URL` | ⚠️ **Documented** — `.env.example` + deployment checklist; must be set in Vercel (owner). |
| M-1 No OG image | ✅ **Resolved** — `opengraph-image` + `twitter-image` (on-brand, dependency-free). |
| M-2 Lightbox focus | ✅ **Resolved** — focus trap + initial focus + restoration. |
| M-4 Mobile menu lingers | ✅ **Resolved** — closes on route change. |
| i18n architecture (task) | ✅ **Seam built** — locale config, locale-aware metadata + hreflang; **English NOT shipped** (deliberate). |
| Photographer identity (task) | ✅ **Model built** — `content/photographer.ts` single source; about page + JSON-LD consume it. Needs real name/bio (owner). |

**Remaining launch blockers are content/ops, not code:** real photographs, the photographer's real name + bio, the legal/business details behind the `TODO(operator)` markers, and the production env vars (`NEXT_PUBLIC_SITE_URL`, Resend keys). See launch-blockers-v1.md §"Manual steps required from the business owner".

---

## 1. Executive summary

The homepage is genuinely flagship-grade: a long-form, image-first narrative built on a disciplined, well-documented design system (one rhythm, two easings, one CTA grammar, a hydration-safe reveal engine, CLS≈0 placeholder-first imagery). It is the right benchmark.

The problem is **two generations of code in one repo.** The homepage and its components (D010→D024, the `home/` directory) are the new flagship language. The five inner pages — `/galeries`, `/galeries/[genre]`, `/a-propos`, `/prestations`, `/contact` — were committed earlier (`487e894`, "layout shell + page routes") and were never brought up to the new standard. They use a different vertical rhythm, no section-heading system, no motion, no eyebrows, and (on the galleries index) bordered cards that directly contradict the homepage's de-boxed philosophy. A visitor who scrolls the homepage and then clicks "Galeries" leaves the flagship experience and lands on a competent-but-ordinary template. This is the single largest coherence gap, and it is entirely fixable because the design system already exists — the inner pages simply need to consume it.

Separately, the site is **not launch-ready as a product**, independent of design. The contact form does nothing (`DELIVERY_WIRED = false`), there are no real photographs (the entire site is directed placeholders by intent), the photographer's name and bio are draft `TODO`s, and there are **no legal pages** — which in France is not a nicety but a legal requirement (mentions légales under the LCEN; a privacy notice under the RGPD, since the form and Vercel Analytics both collect data).

**Bottom line:** the design foundation is excellent and the technical hygiene is strong (build green, all static, lean bundle, CLS≈0, reduced-motion respected). What stands between this and launch is **content and compliance, not design** — plus one focused consistency pass to make the inner pages belong to the homepage.

---

## 2. Product inventory

### 2.1 Routes (App Router, all static / SSG)

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | [page.tsx](../src/app/page.tsx) | Static | 11-section flagship narrative |
| `/galeries` | [galeries/page.tsx](../src/app/galeries/page.tsx) | Static | Genre index — **bordered cards** |
| `/galeries/[genre]` | [galeries/[genre]/page.tsx](../src/app/galeries/[genre]/page.tsx) | SSG (5 params) | `dynamicParams = false`, closed set |
| `/a-propos` | [a-propos/page.tsx](../src/app/a-propos/page.tsx) | Static | Bio + portrait, draft copy |
| `/prestations` | [prestations/page.tsx](../src/app/prestations/page.tsx) | Static | Inquiry-led, no public prices + FAQ |
| `/contact` | [contact/page.tsx](../src/app/contact/page.tsx) | Static | Form **not wired** |
| `/_not-found` | [not-found.tsx](../src/app/not-found.tsx) | Static | On-brand 404 |
| `/robots.txt` | [robots.ts](../src/app/robots.ts) | Static | Prod-only indexing |
| `/sitemap.xml` | [sitemap.ts](../src/app/sitemap.ts) | Static | Derived from routable set |
| `/icon.svg` | [icon.svg](../src/app/icon.svg) | Static | Monogram favicon |

**Missing route files:** no `error.tsx` (no client-error boundary), no `loading.tsx` (acceptable — fully static), no `opengraph-image.tsx` (social shares render text-only), no legal routes (`/mentions-legales`, `/confidentialite`).

### 2.2 Layouts & shells
- [layout.tsx](../src/app/layout.tsx) — root: fonts (Fraunces/Inter via `next/font`), metadata base, `SiteHeader` + `main` + `SiteFooter` + `Analytics`. `lang="fr"`, `og:locale = fr_FR` hardcoded.
- [site-header.tsx](../src/components/layout/site-header.tsx) — sticky on inner pages; floats transparent over the dark hero on home, settles to solid on scroll. Mobile = no-JS `<details>` disclosure.
- [site-footer.tsx](../src/components/layout/site-footer.tsx) — single editorial footer, no top margin (reads as the close of the dark contact band on home).
- [container.tsx](../src/components/layout/container.tsx) — the one `max-w-6xl` wrapper.

### 2.3 Reusable components
- **UI:** [ButtonLink](../src/components/ui/button-link.tsx) (primary pill / secondary draw-underline), [ImageFigure](../src/components/ui/image-figure.tsx) (the single image presentation — real `next/image` or directed reserved frame).
- **Gallery:** [GalleryView](../src/components/gallery/gallery-view.tsx) (masonry grid → lightbox), [HorizontalGallery](../src/components/gallery/horizontal-gallery.tsx) (the infinite drag/inertia reel), [Lightbox](../src/components/gallery/lightbox.tsx) + [useLightbox](../src/components/gallery/use-lightbox.ts).
- **Motion:** [Reveal](../src/components/motion/reveal.tsx) (hydration-safe scroll reveal), [Parallax](../src/components/motion/parallax.tsx), [usePrefersReducedMotion](../src/components/motion/use-prefers-reduced-motion.ts), shared [scroll source](../src/lib/scroll.ts).
- **Home sections (the canon):** Hero, SignatureLine, AboutPreview, ExperienceSteps, FeaturedReel, ServicesShowcase, PricingInvestment, AddOns, DiscoverCards, Testimonials, FinalCta + [SectionHeading](../src/components/home/section-heading.tsx).
- **Forms:** [ContactForm](../src/components/contact-form.tsx) (client; submit stubbed).

### 2.4 Content model (typed data, no CMS)
- [content/site.ts](../src/content/site.ts) — identity, nav, `copy` (UI strings).
- [content/home.ts](../src/content/home.ts) — the long-form homepage narrative.
- [content/galleries.ts](../src/content/galleries.ts) — 5 genres × 6 reserved frames + the curated `featured` reel.
- [content/pricing.ts](../src/content/pricing.ts) — 2 packages (no figures) + 4 FAQ entries.
- [content/testimonials.ts](../src/content/testimonials.ts) — **empty array by design** (real-only).

### 2.5 State inventory
| State | Status |
|---|---|
| Empty (testimonials) | ✅ Designed integrity state ([testimonials.tsx:72](../src/components/home/testimonials.tsx#L72)) |
| Empty (gallery genre) | ⚠️ A genre with `images: []` would render a blank grid; the index links **all** genres unconditionally ([galeries/page.tsx:21](../src/app/galeries/page.tsx#L21)) despite the type comment promising "not linked while empty" |
| Loading | N/A (static) |
| Error boundary | ❌ Missing (`error.tsx`) — default Next error UI |
| 404 | ✅ On-brand |
| Form submitted | ✅ Handled; ❌ no pending/error (form not wired yet) |
| Reserved image | ✅ Directed art-board placeholder (the project's signature) |

### 2.6 Technical-debt register (detail in §4 and §9)
1. Inner pages are pre-flagship — different rhythm, no `SectionHeading`, no `Reveal`, no eyebrows.
2. Galleries index uses bordered cards (contradicts D021 de-boxed rule).
3. Contact submit button **re-implements** the primary pill inline instead of sharing one definition with `ButtonLink`.
4. `bg-[#f3ece1]` band tint is a hardcoded 6th surface colour, duplicated in two components.
5. The light-placeholder radial gradient string is duplicated (`ImageFigure` + `DiscoverCards`).
6. Galleries index links genres that may be empty (state gap above).
7. No legal pages; no structured data; no OG image (see §9).

---

## 3. Design system map

This is the **extracted, canonical** design language from the homepage. Treat this as the spec the rest of the site must conform to.

### 3.1 Typography
- **Families:** Fraunces (display serif, weights 400/500/600) and Inter (body), both `next/font` with `display: swap`, exposed as `--font-serif` / `--font-sans` ([layout.tsx:12-24](../src/app/layout.tsx#L12), [globals.css:41-42](../src/styles/globals.css#L41)).
- **Display scale (homepage):** hero `text-[2.3rem]→sm:5xl→lg:6xl`; signature pull-quote `text-[1.9rem]→sm:5xl→lg:6xl`; séance ledes `text-5xl→6xl→7xl→8xl`; section titles (`SectionHeading`) `text-3xl sm:text-4xl`.
- **Eyebrow rule:** `text-xs uppercase tracking-[0.22em] text-muted` (canonical, [section-heading.tsx:25](../src/components/home/section-heading.tsx#L25)). Variants in the wild use `tracking-[0.24em]`/`0.28em`/`0.36em` — close, not identical.
- **Body rule:** `text-muted`, `text-pretty`, constrained measure (`max-w-md`/`max-w-2xl`). Titles use `text-balance`.
- **Line heights:** display `leading-tight`/`leading-[1.05]`/`[0.95]`/`[0.9]`; body default/`leading-snug`.

### 3.2 Spacing — the 5/6-token rhythm
Documented in [globals.css:4-27](../src/styles/globals.css#L4). Base unit 0.25rem, no arbitrary values:

| Token | px | Tailwind | Use |
|---|---|---|---|
| XS | 24 | `6` | micro |
| S | 40 | `10` | flow start |
| M | 64 | `16` | flow end / heading→content |
| L | 96 | `24` | inter-block |
| XL | 128 | `32` | paper→paper desktop gap |

- **FLOW** (standard section): `py-10 sm:py-16`.
- **CLOSE** (dark contact band **only**): `py-16 sm:py-24`.
- Heading→content: `mt-10 sm:mt-16`. Inter-block: `space-y-16 sm:space-y-24`.

### 3.3 Motion
- **Two easings:** `--ease-settle` (hover/focus) and `--ease-arrive` (entrances); a third `--ease-discover` for the menu reveal ([globals.css:44-50](../src/styles/globals.css#L44)). Everything decelerates to rest — no spring.
- **Interaction clock:** all `a/button/summary` share one transition (300ms enter-state, 200ms on hover, instant active-dim) defined once globally ([globals.css:144-162](../src/styles/globals.css#L144)). **Components must not set their own transition utilities** (vault rule).
- **Entrances:** run-once `motion-rise`/`motion-image-fade` (600–700ms) + scroll `Reveal` (800–1100ms, opacity+transform only). Hydration-safe: renders visible on SSR, arms only below-fold after mount ([reveal.tsx](../src/components/motion/reveal.tsx)).
- **Scroll-driven:** hero push-in scale (`HeroMedia`) and `Parallax`, both compositor-only (transform), both off under reduced motion, both on one shared scroll subscription ([lib/scroll.ts](../src/lib/scroll.ts)).
- **Reduced motion:** global backstop collapses all of it ([globals.css:182](../src/styles/globals.css#L182), [motion.css:98](../src/styles/motion.css#L98)).

### 3.4 Colour
| Token | Hex | Role |
|---|---|---|
| `--color-ink` | `#2a2420` | text / dark surfaces |
| `--color-paper` | `#faf6f0` | signature surface |
| `--color-muted` | `#8c8178` | secondary text |
| `--color-line` | `#e7ddd0` | hairline |
| `--color-clay` | `#b07159` | single accent (links/marks only, never buttons/gradients) |

- **Dark sections** invert details via `.dark-surface` (focus rings, selection).
- **Off-system:** `#f3ece1` warm band tint (used twice, not a token), plus placeholder radial-gradient hex pairs. See §4.
- **Contrast risk:** `text-muted` on `paper` ≈ **3.5:1** — passes AA-Large, **fails AA for normal-size body** (needs 4.5:1). Used widely for body copy. See §9.

### 3.5 Canonical components
- **Primary CTA** — `ButtonLink variant="primary"`: 52px pill, thin border, no fill at rest, gentle ink (or paper-on-dark) fill on hover, arrow advances 5px. One per viewport.
- **Secondary CTA** — `ButtonLink variant="secondary"`: text link, clay underline draws from the left, arrow advances. No box ever.
- **Text link** — clay underline, `underline-offset-4`, `hover:text-clay`.
- **Navigation** — slim header, active item underlined, `aria-current="page"`, wayfinding `isActive` (genre keeps `/galeries` active).
- **Cards** — **there are none by design** (D021): hairlines + whitespace, not boxes.
- **Galleries** — `ImageFigure` (borderless) in either masonry (`GalleryView`) or the reel (`HorizontalGallery`); shared `Lightbox`.
- **Forms** — wrapped `<label>`, `border-line` inputs, `focus:border-clay`, `role="status"` confirmation.
- **Footer** — one editorial line, brand serif + inline nav + hairline copyright.
- **Mobile nav** — `<details>` disclosure, solid panel, works without JS.

---

## 4. Consistency audit

The homepage is the benchmark. Each row is a place the rest of the product diverges. Format: **current → homepage equivalent → business impact → effort → recommendation.**

### 4.1 Inner pages use the old, plainer idiom (the headline issue)

| # | Current | Homepage equivalent | Business impact | Effort | Recommendation |
|---|---|---|---|---|---|
| C1 | Inner page titles are raw `<h1 class="font-serif text-4xl">` with no eyebrow ([galeries](../src/app/galeries/page.tsx#L17), [a-propos](../src/app/a-propos/page.tsx#L16), [contact](../src/app/contact/page.tsx#L16), [prestations](../src/app/prestations/page.tsx#L17)) | `SectionHeading` — eyebrow + `text-3xl sm:text-4xl` serif + intro | Pages read as a different, older site; breaks the "one voice" promise | **S** | Introduce a page-header primitive (eyebrow + h1 + intro) mirroring `SectionHeading`; apply to all four |
| C2 | All inner pages use `py-16 sm:py-24` (the **CLOSE** token reserved for the dark band) | Standard sections use **FLOW** `py-10 sm:py-16` | Subtle rhythm mismatch; pages feel "heavier" than the home sections | **S** | Standardise inner-page top/bottom to the FLOW token (or document a deliberate "page" rhythm token) |
| C3 | No `Reveal`/entrance motion on any inner page | Every homepage block reveals on scroll | Inner pages feel static/dead after the cinematic home | **S** | Wrap inner-page blocks in `Reveal` (already hydration-safe, zero risk) |
| C4 | `mt-12` (48px), `mt-4` used for layout spacing on inner pages | 48px is **not** in the documented rhythm (6/10/16/24/32/40) | Off-grid spacing accumulates as drift | **XS** | Replace `mt-12` with `mt-10`/`mt-16`; keep `mt-4`/`mt-6` only for type micro-spacing |

### 4.2 De-boxed philosophy violated

| # | Current | Homepage equivalent | Business impact | Effort | Recommendation |
|---|---|---|---|---|---|
| C5 | Galleries index renders **bordered cards**: `border border-line p-6 hover:border-clay` ([galeries/page.tsx:25](../src/app/galeries/page.tsx#L25)) | D021 de-boxed: hairlines + whitespace, imagery is the object (`PricingInvestment`, `AddOns`, `ServicesShowcase`) | The first page after home contradicts the core art direction | **M** | Rebuild the index as an editorial list of genre **cover frames** (`ImageFigure` per genre) with title/intro beneath — same pattern as the séance spreads |
| C6 | Galleries index has **no imagery** — text-only cards | Homepage is image-first everywhere | A photographer's gallery index showing zero images undersells the work | **M** | Add a `cover` reserved frame per genre in `galleries.ts`; the index becomes a visual contact sheet |

### 4.3 Duplicated / drifting solutions

| # | Current | Homepage equivalent | Business impact | Effort | Recommendation |
|---|---|---|---|---|---|
| C7 | Contact submit **re-implements the pill inline** (`h-[52px] rounded-full border border-ink/35 …` [contact-form.tsx:78](../src/components/contact-form.tsx#L78)) + uses `active:scale-[0.99]` while the global clock uses `active{opacity:.7}` | One `ButtonLink` defines the pill | Two definitions drift; two different active treatments | **S** | Extract the pill into a shared style/`Button` primitive that both `ButtonLink` and the form submit consume (`ButtonLink` is an anchor and can't be a `type=submit`, so a shared class or a `Button` component is the right factoring) |
| C8 | `bg-[#f3ece1]` band tint hardcoded in two files ([experience-steps.tsx:11](../src/components/home/experience-steps.tsx#L11), [add-ons.tsx:15](../src/components/home/add-ons.tsx#L15)) | All other surfaces are `@theme` tokens | Tint change = 2+ edits, risk of divergence | **XS** | Add `--color-sand: #f3ece1` to `@theme`; use `bg-sand` |
| C9 | Light-placeholder radial gradient string duplicated ([image-figure.tsx:66](../src/components/ui/image-figure.tsx#L66), [discover-cards.tsx:55](../src/components/home/discover-cards.tsx#L55)) | One placeholder treatment intended | Placeholder look could drift between surfaces | **XS** | Promote to a single utility class (e.g. `.frame-reserved`) in `globals.css` |
| C10 | Three nav idioms: testimonials arrows (`h-11 w-11` ring), lightbox arrows (`text-3xl` glyphs), reel chevrons (SVG, no chrome) | — | Minor; each is contextual | **S** (optional) | Acceptable as-is; if unifying, share the circular-arrow control between testimonials and lightbox |

### 4.4 What is already consistent (credit where due)
- Header/footer are shared and behave correctly across all routes.
- `prestations` correctly uses `ButtonLink` and the `<details>` FAQ accordion.
- `a-propos` correctly uses `ImageFigure`.
- The lightbox is a single shared component reused by every gallery surface.
- Focus treatment, selection, reduced-motion, and the interaction clock are global and uniform.

---

## 5. Missing content

Thinking as a premium photography business. None implemented here — each carries business value, effort, and a launch-priority call.

| Area | Status | Business value | Effort | Launch priority |
|---|---|---|---|---|
| **Mentions légales** | ❌ Missing | **Legally mandatory in France** (LCEN) for any published site | S | **Launch blocker (legal)** |
| **Privacy / RGPD notice** | ❌ Missing | Mandatory — the form collects personal data; Vercel Analytics runs | S | **Launch blocker (legal)** |
| Image licensing / usage rights | Partial ("Droits d'usage privé" line only) | Sets expectations; reduces disputes; SEO/E-E-A-T | S | After launch |
| FAQ | ✅ 4 entries on `/prestations` | Removes buying friction | — | Expand post-launch |
| Booking process | Partial (homepage `ExperienceSteps`, 4 steps) | Already covered well enough | — | OK at launch |
| Preparation guide (what to wear / where) | ❌ Missing | High value for premium positioning; reduces session anxiety | M | High-impact, post-launch |
| Travel policy | Partial (FAQ + "partout dans le monde") | Important for the international audience | S | High-impact |
| Pricing explanation | Structure only, no figures (on request) | Acceptable strategy (D012); could add a deeper "what's included" | S | OK at launch |
| Testimonials | Empty (by design) | Trust driver | — | See §7 — not a blocker |
| Terms / CGV (deposits, cancellation) | ❌ Missing | Protects a service business taking deposits | M | After launch (unless taking deposits at launch) |
| Location coverage page | Lyon + travel mentioned | Local SEO | M | After launch |

**Highest-value missing content:** the two legal pages (compliance), then a preparation guide and a formal travel policy (both directly serve conversion and the international audience).

---

## 6. Internationalization feasibility

**Current state.** Single-locale, French. `lang="fr"` and `og:locale = fr_FR` are hardcoded ([layout.tsx:35,45](../src/app/layout.tsx#L35)); there is no `[lang]` segment, no middleware, no `hreflang`, no language switcher. All copy is centralised in `site.ts` / `home.ts` / `pricing.ts` and components import it directly — the seam exists, but it is not yet a locale-keyed dictionary.

**What "/ → fr, /en → en" requires (no runtime translation):**
1. **Dictionary refactor** — wrap every `copy`/`home`/`pricing`/`galleries` string set as `{ fr, en }` (or a `dictionaries/{fr,en}.ts` pair). Effort: **M** (mechanical but touches every content file).
2. **Routing** — either an `app/[lang]/…` restructure (cleaner, but moves every route) or a parallel `app/en/…` tree. Effort: **M–L**.
3. **Language switcher** — desktop header + mobile `<details>` menu, preserving the current path. Effort: **S**.
4. **Localised metadata** — per-locale `title`/`description`, `og:locale`, and `alternates.languages` (`hreflang` fr/en + `x-default`). `buildMetadata` and `seo.ts` need a locale parameter. Effort: **S**.
5. **Localised structured data, nav, forms** — once §9's JSON-LD exists, it must be locale-aware; nav labels and form strings come from the dictionary. Effort: **S** (rides on 1–4).
6. **Slug policy decision** — keep French slugs under `/en` (`/en/galeries`) or translate them (`/en/galleries`)? Translating slugs is more work and more redirect surface; keeping French slugs is pragmatic.

**Evaluation:**
- **Implementation complexity:** Medium-high — mostly the routing restructure and the dictionary refactor.
- **Maintenance cost:** Doubles every copy change forever. Acceptable *only once copy is final*.
- **SEO impact:** Positive *if* there is real, indexable content. With placeholder copy and no photos, the EN tree would index thin/duplicate-intent pages — marginal-to-negative now.
- **Business value:** Real (international bookings already happen, English is "strategically important") — but it compounds *after* there is real content to translate.

**Explicit answer — should English ship before or after launch?**
**After launch.** Translating draft copy that will still change means translating twice; the routing work is real (M–L) for near-zero pre-launch SEO benefit while the site has no photos and an inert form. **Do this instead:** during the consistency pass, perform the **dictionary refactor only** (step 1) so the seam is locale-ready, then add EN routing + switcher + hreflang as the first **post-launch** high-impact project, once French content is real. This sequences the cost to match the value.

---

## 7. Testimonials strategy

**Current state.** `testimonials.ts` is an empty array by deliberate policy (real-only, never fabricated). The section renders a confident integrity statement, not a "coming soon" — *"Les mots de mes clientes trouveront leur place ici — vrais, et jamais inventés."* ([testimonials.tsx:72](../src/components/home/testimonials.tsx#L72)). The component already supports a manual (non-autoplay) carousel the moment real quotes exist, with no layout change.

**Should testimonials block launch? No.** The empty state is dignified and on-brand, and the same shape accepts real quotes later. Blocking launch on social proof that must be genuinely collected would be the wrong trade.

**Recommended workflow:**
1. **Now:** launch with the reserved state as-is. There is no Google Business profile, so there is nothing to pull yet.
2. **Collect:** add a one-line ask to the post-session delivery email ("if you'd be happy for me to share a few words…"). Lowest-friction, highest-authenticity source.
3. **Curate:** hand-enter 3–5 real quotes (name + city) into `testimonials.ts` within the first weeks. Keep them short and specific.
4. **Screenshots:** treat private-conversation screenshots as *source*, not display — transcribe to text quotes (consistent, accessible, legible). Don't display raw screenshots; they break the editorial system and raise consent/privacy questions.
5. **Future:** create a Google Business profile in parallel (independent local-SEO value). A future reviews pull can populate the same `Testimonial[]` shape — no UI work.

---

## 8. Contact workflow roadmap

**Current state.** The form is intentionally **not wired**: `DELIVERY_WIRED = false` ([contact-form.tsx:15](../src/components/contact-form.tsx#L15)); submit is intercepted and shows *"Le formulaire sera bientôt connecté."* The site's single conversion goal therefore does not work. **Wiring delivery is the #1 functional launch blocker** (see §10). `site.contact.email` is also empty ([site.ts:26](../src/content/site.ts#L26)), so there is currently no fallback contact channel except Instagram.

**Future integration plan (documented, not implemented):**

| Step | Recommendation | Effort | Priority |
|---|---|---|---|
| **Email delivery** | Route Handler (`app/api/contact/route.ts`) + Resend (owns the domain story) **or** Formspree (zero-backend, fastest to launch). Add real states: pending / success / error | M | **Launch blocker** |
| **Spam protection** | Honeypot field + time-to-submit check + server-side rate limit; add Cloudflare Turnstile only if abuse appears (avoid friction on a premium form) | S | **Launch blocker** (basic honeypot at minimum) |
| **Automated response** | Branded auto-acknowledgement to the client ("I've received your message, I reply within a few days") matching the copy's promise | S | High-impact |
| **Lead tracking** | Start with a structured inbox label / spreadsheet; formalise later | S | After launch |
| **CRM integration** | HubSpot/Notion/Airtable or a French alternative; map the form's `occasion` + message; trigger pipeline stages | L | After launch |
| **Fallback channel** | Populate `site.contact.email` so there's a non-form path | XS | **Launch blocker** |

**Pragmatic launch path:** Formspree (or a Resend Route Handler) + honeypot + a real email address. That clears the blocker in well under a day; CRM and lead automation are genuinely post-launch.

---

## 9. Technical audit

Build, typecheck, and lint all pass clean on the audited commit. Issues below are ordered by severity.

### Critical
- **C-1 — Contact form is inert.** `DELIVERY_WIRED = false`. The conversion does nothing. (See §8.)

### High
- **H-1 — No legal pages.** Mentions légales (LCEN) and an RGPD privacy notice are legally required in France; the form + Vercel Analytics process personal data. (See §5.)
- **H-2 — No structured data.** No JSON-LD anywhere (verified: zero `schema.org`/`ld+json` in `src`). A local service business should expose `LocalBusiness`/`ProfessionalService` (name, areaServed Lyon, sameAs Instagram) and ideally `Person` + `ImageObject`. High local-SEO ROI, low effort.
- **H-3 — Body-text contrast.** `text-muted` (`#8c8178`) on `paper` (`#faf6f0`) ≈ **3.5:1** (relative-luminance estimate) — below WCAG AA 4.5:1 for normal text; it's used for body paragraphs throughout. Either darken `--color-muted` (~`#6f655c` reaches ~4.6:1) or reserve `text-muted` for large text and use `text-ink/80` for body.
- **H-4 — `NEXT_PUBLIC_SITE_URL` must be set in production.** Canonical and OpenGraph URLs fall back to `http://localhost:3000` if unset ([lib/site.ts:9](../src/lib/site.ts#L9)). A misconfigured deploy poisons every canonical/OG URL.

### Medium
- **M-1 — No `opengraph-image`.** Shared links (Instagram bios, DMs — a real referral path here) render text-only. Add `app/opengraph-image.tsx` (and per-key pages later). Once real photos exist, use a signature frame.
- **M-2 — Lightbox focus management.** `role="dialog" aria-modal="true"` is set, but there's no focus trap, no initial focus into the dialog, and no focus restoration on close ([lightbox.tsx](../src/components/gallery/lightbox.tsx)). Keyboard users can tab out behind the overlay.
- **M-3 — No `error.tsx` boundary.** A client error shows the default Next error page rather than an on-brand fallback.
- **M-4 — Mobile `<details>` menu doesn't auto-close on navigation.** After tapping a link the panel can remain open on the next page (no `pathname`-driven close in [site-header.tsx](../src/components/layout/site-header.tsx)).
- **M-5 — Inner-page design inconsistency** (full detail in §4) — UX coherence debt.

### Low
- **L-1** — `#f3ece1` band tint not tokenised (C8). **L-2** — duplicated placeholder gradient (C9). **L-3** — contact submit duplicates the pill (C7). **L-4** — `mt-12` off the rhythm (C4). **L-5** — galleries index can link an empty genre (§2.5).

### What's genuinely strong
- **Hydration:** engineered safe (D015) — `Reveal` renders visible on SSR + first client render; `usePrefersReducedMotion` starts `false` to match SSR. No client-only render branches.
- **CLS ≈ 0:** every image (real or reserved) sits in a fixed aspect frame; reveals animate only opacity/transform; fonts use `display: swap` (variable fonts, no shift).
- **LCP:** hero is currently a CSS gradient (instant); the real hero frame is wired `priority` + `fill` + `sizes="100vw"` ([hero-media.tsx](../src/components/home/hero-media.tsx)).
- **Bundle:** dependencies are `next`, `react`, `react-dom`, `@vercel/analytics` only — no animation libraries, no CSS-in-JS runtime. Client JS limited to header, form, reel, lightbox, testimonials, and the two motion hooks.
- **Images:** `next/image` configured for AVIF/WebP ([next.config.ts](../src/next.config.ts)); responsive `sizes` provided everywhere. *To add when real photos land:* intrinsic `width`/`height` (the type already requires it) + `blurDataURL` for blur-up.
- **Keyboard:** reel is a focusable region with ←/→; FAQ and mobile nav are native `<details>`; focus-visible is global and inverts on dark surfaces.
- **SEO plumbing:** per-page canonical via `buildMetadata`, prod-only `robots`, derived `sitemap`, title template. Solid base — just missing structured data and OG images.

---

## 10. Prioritized roadmap

Each item: **impact · effort · dependencies.**

### Phase 1 — Launch blockers (must ship before public launch)
| # | Item | Impact | Sprint-1 status |
|---|---|---|---|
| 1 | **Wire the contact form** (Resend Route Handler) + honeypot + real states; fallback channel | Critical — restores the only conversion | ✅ **Code complete** — set Resend env vars + real inbox to activate |
| 2 | **Real photographs** — hero + each of the 5 galleries | Critical — it's a photography site | ⛔ **Owner** — placeholder-ready; drop `src` in, zero layout change |
| 3 | **Real photographer name + bio + portrait** | Critical — trust + the about page | ⚙️ **Model ready** (`content/photographer.ts`) — fill `name`/`biography`/portrait |
| 4 | **Mentions légales + RGPD privacy notice** | Critical — legal compliance (FR) | ✅ **Pages live + linked** — fill business `TODO(operator)` details |
| 5 | **Set `NEXT_PUBLIC_SITE_URL`** in Vercel production | High — correct canonical/OG | ⚠️ **Documented** — set in Vercel (see `.env.example`) |

### Phase 2 — High-impact (important, not mandatory for day one)
| # | Item | Impact | Effort | Dependencies |
|---|---|---|---|---|
| 6 | **Inner-page consistency pass** — page-header primitive (eyebrow+h1+intro), `Reveal`, FLOW rhythm, de-card the galleries index into cover frames (C1–C6) | High — closes the coherence gap | M | Design system (exists) |
| 7 | **Structured data** (JSON-LD `LocalBusiness`/`Person`/`ImageObject`) | High — local SEO | S | Real business details |
| 8 | **OpenGraph image(s)** | High — referral/social CTR | S | A signature photo |
| 9 | **Fix `text-muted` body contrast** (H-3) | High — accessibility/legibility | XS | — |
| 10 | **i18n dictionary refactor** (locale-key the content; no routing yet) | Medium — unblocks EN later | M | Final-ish FR copy |
| 11 | **Spam auto-response + preparation guide + formal travel policy** | Medium — conversion + intl audience | S–M | Copy |

### Phase 3 — Future (after launch)
| # | Item | Impact | Effort | Dependencies |
|---|---|---|---|---|
| 12 | **English locale** — routing + switcher + hreflang + localized metadata/structured data | High (intl) | M–L | #10 + real FR content |
| 13 | **Real testimonials** via post-session workflow; later Google Business pull | Medium | S | Client consent |
| 14 | CRM + lead tracking | Medium | L | #1 |
| 15 | Custom domain (swap the env var) | Medium | XS | Domain |
| 16 | Lightbox focus trap, `error.tsx`, mobile-menu auto-close, tokenise `#f3ece1`, dedupe gradient/pill (M-2..M-4, L-1..L-3) | Low–Medium | S total | — |
| 17 | Per-image `blurDataURL`; Lighthouse pass once real assets land | Medium | S | Real photos |

---

## 11. Honest verdict

This is a strong, disciplined codebase with a genuinely flagship homepage and excellent technical hygiene — build green, all routes static, lean bundle, CLS≈0, hydration-safe, reduced-motion respected. The design system is real and well-documented. The gap to launch is **not design quality**; it's **content, compliance, and one consistency pass.** The placeholder-first approach was the right call — but placeholders are an evaluation tool, not a product, and a photography site cannot go public without photographs, a working inquiry path, a name, and the legal pages French law requires.

**What prevents launch today?**
1. The contact form does nothing (`DELIVERY_WIRED = false`) — the only conversion is broken.
2. There are no real photographs anywhere — the site is entirely directed placeholders.
3. No photographer name/bio (draft `TODO`s).
4. No mentions légales and no RGPD privacy notice — legally required in France with a data-collecting form + analytics.
5. `NEXT_PUBLIC_SITE_URL` not guaranteed set in production (canonical/OG would resolve to localhost).

**What can wait until after launch?** English; real testimonials; CRM/lead automation; custom domain; the lower-severity polish (lightbox focus trap, `error.tsx`, mobile-menu auto-close, tokenising the band tint, deduping the pill/gradient); terms/CGV and a dedicated location page.

**Highest-ROI improvements (after the blockers):** structured data (H-2) and an OG image (M-1) — small effort, outsized SEO/referral return — followed by the inner-page consistency pass (#6), which is the cheapest way to make the *whole* product feel as premium as the homepage because the design system already exists. Fixing `text-muted` contrast (H-3) is nearly free and helps everyone.

**Is English worth implementing now?** No — **after launch.** Do the dictionary refactor now so the seam is ready, but defer EN routing/switcher/hreflang until French content is real. Translating draft copy means translating twice, and an English tree over placeholder content yields little-to-negative SEO today.

**Should testimonials delay launch?** No. The empty state is dignified and on-brand and the component accepts real quotes with zero layout change. Collect them post-session and curate 3–5 in the first weeks.

**The single next highest-value task:** **Wire the contact form to real email delivery** (Formspree or a Resend Route Handler) with basic spam protection and a real fallback address. It is the cheapest blocker to clear and it restores the entire point of the site — letting a visitor inquire. Everything else (photos, name, legal) can proceed in parallel, but a beautiful site whose inquiry button does nothing is not launch-ready at any level of polish.
