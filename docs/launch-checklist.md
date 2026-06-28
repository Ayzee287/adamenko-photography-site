# Launch Checklist — Adamenko Photography

**Owner of this document:** release engineer.
**Purpose:** the single, current source of truth for taking the site from *engineering-complete*
to *live in production*. Supersedes the embedded checklist in
[launch-blockers-v1.md](./launch-blockers-v1.md) §4 (kept for history). Owner-facing content tasks
live in [owner-todo.md](./owner-todo.md); deployment mechanics in the vault
`maintenance-and-deployment` note.

**Status (2026-06-28):** **Repository is production-ready.** Every engineering and repository-side
item below is ✅ done and verified. The remaining open items are **external operations only**
(accounts, the Vercel import, environment variables, and post-deploy verification) — none of them
are code.

---

## How the launch gate breaks down

| Track | State | Who |
|---|---|---|
| **Engineering** | ✅ Complete + verified (see §1) | — |
| **Infrastructure** | 🔴 Pending — Vercel import + env vars (§2) | Operator |
| **Operations** | 🔴 Pending — Resend account + verified sending domain (§3) | Operator |
| **Content** | 🟠 Mostly done; owner confirmations remain (§4) | Owner |
| **Post-deploy verification** | 🔬 Pending — runs against the live deploy (§5) | Operator/Owner |

---

## 1 · Engineering — ✅ complete (verified in-repo)

All of the following were verified against a real `next build` on 2026-06-28. No engineering work
remains.

- [x] **Production build green** — `next build` succeeds; **21 routes** (static + 5 SSG genre pages;
  only `/api/contact` is dynamic/`nodejs`).
- [x] **Type-safe + lint-clean** — `tsc --noEmit` and `eslint` both pass with zero errors.
- [x] **Env-gated indexing verified both ways:**
  - *Production* (`VERCEL_ENV=production`, `NEXT_PUBLIC_SITE_URL` set) → `robots.txt` emits
    `Allow: /` + `Host:` + `Sitemap:` with absolute production URLs; `sitemap.xml` lists **12**
    absolute production URLs (7 fixed + 5 genres).
  - *Non-production* (default/preview) → `robots.txt` emits `Disallow: /` **and** every page carries
    `<meta name="robots" content="noindex, nofollow">` (belt-and-braces). Preview/local builds can
    never be indexed.
- [x] **Canonical + social metadata** — per-page canonical via `buildMetadata` (defeats Next's
  inheritance trap); OpenGraph + `summary_large_image` Twitter card; photo-backed OG image
  (build-safe, dependency-free); `og:locale = fr_FR`; hreflang `fr` + `x-default` (single-locale
  honest).
- [x] **Structured data** — site-wide `LocalBusiness`/`ProfessionalService` JSON-LD with founder
  `Person`, built from the single identity model (`content/photographer.ts`), real hero + portrait
  images wired.
- [x] **Icons + browser chrome** — `icon.svg` favicon **and** a real `apple-icon.png` (180×180)
  apple-touch-icon both emit; `theme-color #faf6f0` set via the `viewport` export.
- [x] **Contact API production-grade + safe when unconfigured** — `/api/contact` posts to the Resend
  REST API (no SDK, nothing at build); honeypot → 200, validation → 422, **missing env → 503 with a
  graceful client fallback** (Instagram/email), provider failure → 502. It never fails silently and
  never crashes the page.
- [x] **Accessibility baseline** — WCAG-AA body contrast; skip-to-content link + landmarks; lightbox
  and mobile-menu focus trap **and restore**; first-class `prefers-reduced-motion` path (incl. zeroed
  stagger delays); accessible form wiring.
- [x] **Performance architecture** — static-first; `next/image` AVIF/WebP + blur-up; `priority` hero
  with preloaded responsive LCP; transform/opacity-only motion (CLS ≈ 0 by construction); 4 runtime
  deps; one ~9.6 KB gz CSS file.
- [x] **Repo hygiene** — no build artifacts tracked (`.next`, `*.tsbuildinfo`, `next-env.d.ts` all
  gitignored); QA screenshots gitignored; no dead launch-blocking code.

> Detailed engineering provenance: vault `decision-log` (D026 → D055), `release-candidate-audit`, and
> the eight 2026-06-27 design reviews.

---

## 2 · Infrastructure — 🔴 operator (Vercel)

The repo is a standard Next.js app; **no `vercel.json` is required** (Vercel auto-detects the
framework). There is nothing to change in the repository here.

- [ ] **Import the repo into Vercel** (`Ayzee287/adamenko-photography-site`) and connect the Git
  integration. *Pushing alone does not deploy until the project is imported.*
- [ ] **Set the four environment variables** in **Project → Settings → Environment Variables**
  (Production **and** Preview). Names + meaning are in [`.env.example`](../.env.example):

  | Variable | Purpose | Notes |
  |---|---|---|
  | `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap/robots/JSON-LD origin | **Required.** Real production origin, no trailing slash. If unset, every canonical/OG URL falls back to `localhost` (verified). |
  | `RESEND_API_KEY` | Contact-form delivery auth | From resend.com (§3). |
  | `CONTACT_TO_EMAIL` | Inbox that receives inquiries | The photographer's real inbox. |
  | `CONTACT_FROM_EMAIL` | The `From` address | **Must be on a Resend-verified domain** (§3) or sends are rejected. |

- [ ] **Branch model** — merge `design-master-pass` → `main`; production deploys from `main`. Preview
  deploys (any branch) stay `noindex` automatically (§1).

---

## 3 · Operations — 🔴 operator (Resend)

- [ ] **Create a Resend account** at resend.com and generate an API key → `RESEND_API_KEY`.
- [ ] **Add + verify the sending domain** (SPF/DKIM DNS records). Set `CONTACT_FROM_EMAIL` to an
  address **on that verified domain** (e.g. `bonjour@<verified-domain>`). Until this is done, the
  contact route returns 503 and the form shows its graceful fallback — the site stays usable.
- [ ] *(Optional, deferred)* custom domain — launch can run on the Vercel subdomain; when a domain
  is ready, point it at Vercel and update `NEXT_PUBLIC_SITE_URL`. **No code change.**

---

## 4 · Content — 🟠 owner confirmations (mostly done)

Real photographs, identity, legal identity, SIRET/address, and a drafted bio are **already in code**.
What remains is owner confirmation, tracked in full in [owner-todo.md](./owner-todo.md):

- [ ] Confirm the **biography** wording (`content/photographer.ts` — currently an approved draft).
- [ ] Confirm **VAT mention** + **data-retention period** on the legal pages (sensible French
  defaults are in place — `content/legal.ts`).
- [ ] *(Optional)* public **pricing** figures (`content/pricing.ts` — omit to keep "Tarif sur
  demande"); 3–5 real **testimonials** (`content/testimonials.ts`); **hi-res** photo masters.

> None of these block a soft launch; they are owner sign-offs and optional enrichers.

---

## 5 · Post-deploy verification — 🔬 against the live deploy

Run once, immediately after the first production deploy, **before** announcing:

- [ ] **Contact flow end-to-end** — submit a real inquiry; confirm the email arrives and `reply_to`
  is the sender; check the spam folder once.
- [ ] **`robots.txt` + `sitemap.xml`** on the production origin show `Allow` + absolute production
  URLs (the env-gating is verified in-repo; this confirms the env var is actually set).
- [ ] **Social card** — paste the production URL into a social-card debugger; confirm the OG image
  renders.
- [ ] **Structured data** — validate the JSON-LD via Google Rich Results.
- [ ] **Lighthouse + PageSpeed (mobile & desktop) + axe** — target LCP < 2.5s · CLS < 0.1 ·
  INP < 200ms · Lighthouse ≥ 90. The architecture predicts green CWV; this run should *confirm*. The
  only field variable is image weight → the hi-res hero swap is the lever if LCP needs a push.
- [ ] **Real-device pass** — a physical iPhone tap of the mobile menu + a keyboard/screen-reader
  sweep of nav, lightbox, and the form.
- [ ] **Search Console** — submit the sitemap; watch first indexing.

---

## 6 · Go-live sequence

1. Owner confirms the §4 content sign-offs.
2. Operator stands up **Resend** (§3) and imports the repo into **Vercel** with the four env vars (§2).
3. Merge `design-master-pass` → `main` → production deploy.
4. Run the §5 post-deploy verification on the live URL.
5. Announce.

**Rollback:** every deploy is immutable on Vercel — if anything regresses, *Instant Rollback* to the
previous production deployment from the Vercel dashboard (no code change, no rebuild).

---

## 7 · Explicitly out of scope for launch (post-launch backlog)

Tracked in the vault `roadmap`; do **not** block launch on these: the SEO structured-data enrichment
runway (`@graph` → `ProfilePage` → `FAQPage` → breadcrumb → per-route OG), the English locale
(`/en` — seam ready), a web-app manifest, a preparation-guide page, and real testimonials collection.
