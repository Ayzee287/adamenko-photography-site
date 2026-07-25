# Adamenko Photography — Portfolio Website

A dark, editorial portfolio for **Adamenko Photography** — an independent **family,
maternity, couple, portrait & wedding** photographer based in **Lyon, France** (weddings
throughout France). Bilingual **French + English**. The site's single job: let a visitor
*feel* the work, then **inquire**. It is image-first and quiet — the interface frames the
photographs and gets out of the way.

- **Live:** [www.adamenko-photography.com](https://www.adamenko-photography.com) — FR at `/`, EN at `/en`.
- **Design direction — "CHAMBRE":** an obsidian darkroom. Serif-led typography, a single
  restrained ember accent, large photography, a living ambient light layer, minimal UI.
- **Strategy, design decisions and history** live in the AI-Studio vault
  (`AI-Studio/01_Clients/Adamenko_Photography/`), **not** in this repo. This repo is the code;
  the README is the map.

## Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, static-first (`next start`) |
| Language | TypeScript (strict) · React 19 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first `@theme`, no config file) + hand-authored `chambre.css` |
| Images | `next/image` — AVIF/WebP, responsive `srcset`, blur-up placeholders |
| Fonts | Fraunces (serif/display) · Inter (sans) via `next/font` |
| Contact | React **Server Action** → [Resend](https://resend.com) (no client API key) |
| Analytics | `@vercel/analytics` · `@vercel/speed-insights` (cookieless) |
| Hosting | [Vercel](https://vercel.com), Git-integrated — `main` → production |

## How it's built (the parts that matter)

**Locale routing — `src/proxy.ts` + the route registry (`src/lib/routes.ts`).**
The whole app lives under `app/[locale]`. **French is canonical and unprefixed** (`/`, `/tarifs`,
`/galeries/mariages`); **English uses localized public slugs** under `/en` (`/en/pricing`,
`/en/galleries/weddings`). `proxy.ts` (`resolveEnRoute`) rewrites a localized EN URL to the
FR-slug route that actually exists and 308-redirects any FR-slug-under-`/en` to its canonical.
`routes.ts` is the **single source of truth for every locale-aware path** — build internal
links with `link(locale, ref)`, never hand-written strings — and `alternatesForPath()` drives
canonical + hreflang + sitemap so URLs can never disagree.

**Content — typed data, not a CMS (`src/content/`).**
`fr.ts` is canonical; `en.ts` is a partial override merged over it (EN falls back to FR field
by field). Per-surface files (`home.ts`, `pricing.ts`, `galleries.ts`, `photographer.ts`,
`faq.ts`, `site.ts`, `ui.ts`, `legal.ts`, `locations.ts`, `testimonials.ts`). `reviews.generated.ts`
is written **only** by the sync (see below) — never by hand. Adding a photo/genre is a data edit.

**Design system — `src/styles/`.** `tokens.css` holds the design tokens (colours, the
type scale, and a **non-linear spacing scale** — `py-8` ≠ 32px; use the named steps, do not
assume default Tailwind spacing). `chambre.css` is the dark theme + every CHAMBRE component
class. `globals.css`, `motion.css`, `typography.css`, `reset.css` complete the base.
**Do not hardcode** what has a source of truth: routes → `link()`, copy → `content/*`,
spacing/colour/type → the tokens.

**Reviews — an editorial single-quote reader (`components/chambre/voices.tsx`).** One real
Google review at a time, full text, in a fixed "stage" so navigating never shifts the page.
Fed by `testimonials.ts` (editorial curation) over `reviews.generated.ts`. Google attribution
is established once by the section + aggregate, not per quote.

**Contact — a Server Action (`src/lib/forms/submit-inquiry.ts`).** Progressive (posts without
JS), shared-schema validation, honeypot, per-IP rate limit. Delivery goes through Resend
(`lib/email/*`); the **owner notification is the success gate** — if mail is unconfigured or
the provider rejects, the form shows an honest error + a mailto fallback and **never fakes
success**. There is no `/api/contact` route.

**Images.** A single `next/image` wrapper (`components/media/photo.tsx`, presented via
`components/chambre/plate.tsx`) — `fill`/`object-cover`, blur-up from `lib/image-blur.ts`, and
CLS-safe because every consumer reserves its aspect box. The hero is `priority`; below-the-fold
frames lazy-load. Masters live in `public/galleries/<genre>/`.

**SEO — env-gated.** Per-page metadata (`lib/seo`), localized canonical + hreflang, JSON-LD
`LocalBusiness`/`Person` (`lib/structured-data.ts`, no fabricated address/phone), `sitemap.ts`,
`robots.ts`. **Only the production deployment is indexable** — `allowIndexing =
VERCEL_ENV === "production"`, so previews carry `noindex` and `robots: Disallow /`. The
canonical origin is `NEXT_PUBLIC_SITE_URL` (a build-time var; falls back to `localhost` in dev).

**Ambient.** `components/chambre/ambient*` render the darkroom (glow, beam, key light, motes,
grain) once, behind everything. On a fine pointer the key light drifts toward the cursor; on
touch the room keeps its autonomous CSS wander. All of it collapses under `prefers-reduced-motion`.

## Repository structure

```
src/
  proxy.ts                 Locale routing (Next-16 middleware): FR unprefixed, EN localized slugs
  app/[locale]/            The bilingual route tree (FR + EN prerendered per locale)
    page.tsx               Accueil · a-propos · tarifs · contact · galeries[/genre]
    prestations[/service]  Per-service SEO landing pages · mentions-legales · confidentialite
    [...notfound]/         Localized branded 404 · opengraph-image · twitter-image
    dev/                   Component/token/type/hook showcase — dev-only (404 in production)
  components/
    chambre/               CHAMBRE system: Scene, Plate, Voices, Overture, Develop, Exhibition, Ambient
    chrome/                Header, Footer, MenuDialog, Navigation, SkipLink, ToTop (back-to-top)
    media/                 Photo (the single next/image call), Lightbox
    forms/                 InquiryForm + fields/states  ·  content/ · actions/ · typography/
  content/                 Typed content — fr.ts (canonical) + en.ts (override); ru/uk drafts inactive
    reviews.generated.ts   Google reviews — written by the sync, never by hand
  lib/                     routes (link/alternates), i18n, seo, structured-data, forms (server action),
                           email pipeline, rate-limit, image-blur, scroll helpers, utils
  styles/                  tokens.css (design tokens) · chambre.css (theme) · globals/motion/typography
scripts/
  sync-reviews.mjs         Rewrites content/reviews.generated.ts from Google Places (npm run sync:reviews;
                           run daily by .github/workflows/sync-reviews.yml)
  gen-blur.mjs             Regenerates the blur-up map after photos change (npm run gen:blur)
  photos-*.mjs             Gallery export/curation helpers  ·  validate-content.mjs
public/galleries/<genre>/  Web-export gallery masters (committed)  ·  home/ about/ brand/
docs/                      Engineering docs (email-architecture, google-reviews, image-guidelines, …)
```

## Local development

```bash
npm install
npm run dev            # http://localhost:3000  (FR at /, EN at /en)
```

```bash
npm run build          # production build            npm run start   # serve the build
npm run typecheck      # tsc --noEmit                npm run lint    # eslint
npm run test           # vitest                      npm run test:e2e# playwright
npm run gen:blur       # regenerate blur placeholders after adding/replacing photos
npm run sync:reviews   # refresh Google reviews (needs the GOOGLE_* vars)
```

> Node 20+ (developed on Node 24). Environment variables are documented in
> [`.env.example`](./.env.example); none are committed and none are hardcoded, so wiring up a
> new domain/keys is config-only. Contact pipeline + DNS: [`docs/email-architecture.md`](./docs/email-architecture.md).
> Reviews sync: [`docs/google-reviews.md`](./docs/google-reviews.md).

## Deployment

Hosted on **Vercel** with Git integration:

- **`main` deploys to production** (`www.adamenko-photography.com`) automatically on push.
- Every other branch gets a **preview deployment** — `noindex` (env-gated) and, by project
  setting, behind Vercel Authentication, so previews never compete in search or leak.
- Required production env: `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
  `CONTACT_FROM_EMAIL` (all set for Production + Preview). `GOOGLE_PLACES_API_KEY` /
  `GOOGLE_PLACE_ID` are used only by the reviews-sync workflow, never at runtime.

## Status

Live in production (CHAMBRE V2). **Pending:** manual **gallery curation** — photo selection and
order are currently automatic; galleries will be sequenced as editorial photographic series in a
dedicated pass. See the vault for the working state and remaining notes.

## License

Source code: [MIT](./LICENSE). **Photographs are © Adamenko Photography — all rights reserved,
not covered by the MIT license.**
