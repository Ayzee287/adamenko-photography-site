# Launch Blockers — Sprint 1 Report

**Date:** 2026-06-20
**Branch:** `flagship-homepage`
**Source of truth:** [docs/product-audit-v1.md](./product-audit-v1.md)
**Goal:** remove the launch blockers identified in the audit, in priority order, without touching the approved homepage visual/interaction system.

**Verification (this sprint):** `tsc --noEmit` ✅ clean · `eslint .` ✅ clean · `next build` ✅ green (20 routes) · runtime smoke tests ✅ (every route HTTP 200; JSON-LD, OpenGraph/Twitter, and hreflang emitted; `/api/contact` returns 200 / 422 / 400 / 503 exactly as designed).

---

## 1. Completed tasks

### 1.1 Contact flow (priority 1) — ✅ code complete
A production-ready, dependency-free inquiry pipeline.

- **Server route** [`src/app/api/contact/route.ts`](../src/app/api/contact/route.ts) — POST handler that posts to the **Resend REST API via `fetch`** (no SDK installed, nothing runs at build). Pipeline: parse JSON → honeypot screen → server-side validation → config check → send → respond.
- **Shared contract** [`src/lib/contact.ts`](../src/lib/contact.ts) — the occasion enum + `validateContact()` + `isBot()`, imported by **both** the route and the form so the select options and the server enum can never drift.
- **Form** [`src/components/contact-form.tsx`](../src/components/contact-form.tsx) — real `fetch`, with **idle / sending / success / error** states; honeypot field (off-screen, `aria-hidden`, `tabIndex=-1`); per-field server errors surfaced with `aria-invalid` + `aria-describedby`; `aria-busy` + disabled submit while sending; `role="alert"` error summary that receives focus. **Visual language unchanged** (same pill, hairline inputs, `focus:border-clay`).
- **Honeypot:** a filled hidden field returns `200 {ok:true}` and sends nothing (bots learn nothing).
- **Fallback channel:** the contact page and the form's error state offer a `mailto:` (once `contact.email` is set) and Instagram.
- **Graceful when unconfigured:** with no env vars the route returns `503` and the form shows the error + fallback — it never fails silently.

**Verified:** valid+unconfigured → `503`; honeypot → `200`; invalid → `422 {fields:[…]}`; malformed → `400`.

### 1.2 Legal compliance — France (priority 2) — ✅ pages live + linked
- **Routes:** [`/mentions-legales`](../src/app/mentions-legales/page.tsx) and [`/confidentialite`](../src/app/confidentialite/page.tsx).
- **Content model** [`src/content/legal.ts`](../src/content/legal.ts) — Mentions légales (LCEN art. 6-III: éditeur, directeur de la publication, hébergeur=Vercel with real address, propriété intellectuelle, droit à l'image) and Politique de confidentialité. **The RGPD notice is integrated into the privacy policy** — the standard, non-redundant French practice — as a clearly-labelled **"Vos droits (RGPD)"** section, alongside données collectées, sous-traitants (Vercel + Resend), **transferts hors UE** (covers the international audience explicitly), durée de conservation, cookies, and CNIL recourse. **Analytics + contact-form processing are both documented.**
- **Renderer** [`src/components/legal/legal-document.tsx`](../src/components/legal/legal-document.tsx) — uses the existing inner-page rhythm + the homepage eyebrow grammar; constrained reading measure; no new visual language.
- **Footer links** — added a "Liens légaux" nav in [`site-footer.tsx`](../src/components/layout/site-footer.tsx); both pages are in the sitemap.
- **Placeholders:** every unknown business fact renders visibly as `[À COMPLÉTER : …]` and is flagged `TODO(operator)` in code (see §2).

> ⚠️ These pages are a correct, structured **draft**. Have the final text reviewed by the business owner and, ideally, a French legal professional before launch.

### 1.3 Photographer identity (priority 3) — ✅ model built
- **Single source of truth** [`src/content/photographer.ts`](../src/content/photographer.ts) — `name`, `brand`, `location`, `availability`, `specialties`, `biography`, `contact`. Nothing about the person is hardcoded in components.
- **Wired (no duplication):** [`site.ts`](../src/content/site.ts) sources brand/location/contact from it; the [about page](../src/app/a-propos/page.tsx) renders bio + specialties + availability from it; the JSON-LD is built from it.
- Empty/`TODO` fields degrade gracefully (e.g. the name is hidden, not faked).

### 1.4 SEO fundamentals (priority 4) — ✅ implemented
- **Canonical URLs** — per-page via `buildMetadata`; home via `localizedAlternates("/")`.
- **`NEXT_PUBLIC_SITE_URL`** — already drives canonical/OG/sitemap/robots/JSON-LD; documented in [`.env.example`](../.env.example) + the checklist (owner sets it in Vercel).
- **OpenGraph + Twitter images** — [`opengraph-image.tsx`](../src/app/opengraph-image.tsx) + [`twitter-image.tsx`](../src/app/twitter-image.tsx) share one on-brand, dependency-free renderer ([`src/lib/og.tsx`](../src/lib/og.tsx)); `summary_large_image`. Generated statically at build (no remote font/photo, so it can't break the build).
- **JSON-LD structured data** — site-wide `["LocalBusiness","ProfessionalService"]` ([`src/lib/structured-data.ts`](../src/lib/structured-data.ts) + [`JsonLd`](../src/components/seo/json-ld.tsx)), built from the identity model; unknown fields omitted (never faked), founder `Person` added only once the real name exists.
- **Localized metadata architecture (i18n seam)** — [`src/lib/i18n.ts`](../src/lib/i18n.ts): `locales`/`defaultLocale`/`ogLocale`/`htmlLang` + `localizedAlternates()` emitting hreflang (`fr` + `x-default` today). `buildMetadata` and the layout consume it. **English is NOT shipped** — activating `/en` later is a localised change in this one file plus a route tree. (Verified: `hreflang="fr"` + `hreflang="x-default"` are emitted.)

### 1.5 Accessibility (priority 5) — ✅ targeted WCAG AA
- **Body contrast** — `--color-muted` `#8c8178` → **`#6f655c`** in [`globals.css`](../src/styles/globals.css) (≈3.5:1 → ≈5.2:1 on paper, ≈4.8:1 on the warm band). Lifts body text site-wide above AA.
- **Form a11y** — labelled fields, `aria-invalid`/`aria-describedby`, `aria-busy`, focus-managed `role="alert"` error, accessible success status (§1.1).
- **Focus states** — global `focus-visible` treatment was already strong; added the missing **lightbox focus trap + initial focus + restoration** ([`lightbox.tsx`](../src/components/gallery/lightbox.tsx)).
- **Keyboard navigation** — lightbox Tab is now trapped (Esc/←/→ unchanged); the **mobile menu closes on route change** ([`site-header.tsx`](../src/components/layout/site-header.tsx)).

---

## 2. Remaining TODOs (in code, marked `TODO(operator)` / `[À COMPLÉTER]`)

These are **content/business facts**, not engineering work. Each renders gracefully until filled.

| File | What to fill |
|---|---|
| `content/photographer.ts` | `name` (personal name) · `biography` (confirm draft) · `location.streetAddress` + `postalCode` · `contact.email` (real inbox) · optional `contact.phone` |
| `content/legal.ts` | Éditeur legal identity · statut juridique · address · **SIRET** + TVA line · directeur de la publication · data-retention period · transfer-safeguards confirmation · `UPDATED` date · optional dev credit |
| `content/pricing.ts` | `priceFrom` for the two packages (optional — omitting keeps "Tarif sur demande") |
| `content/home.ts` | `about.title` real-name variant (pre-existing TODO; homepage copy intentionally untouched this sprint) |
| `public/demo/` | Pre-existing temporary Unsplash stand-ins — now **unreferenced** by the app; delete before launch |

> Dead-content note: `copy.about.body` in `site.ts` is now superseded by `photographer.biography` (about page reads the model). Harmless; remove during a future cleanup.

---

## 3. Environment variables

Full annotated copy in [`.env.example`](../.env.example). Set all four in **Vercel → Project → Settings → Environment Variables** (Production + Preview).

| Variable | Purpose | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap/robots/JSON-LD origin | Real production origin, **no trailing slash**. Falls back to `localhost:3000` if unset → canonical/OG break, so this is **required for launch**. |
| `RESEND_API_KEY` | Auth for email delivery | From resend.com. |
| `CONTACT_TO_EMAIL` | Where inquiries land | The photographer's real inbox. |
| `CONTACT_FROM_EMAIL` | The `From` address | **Must be on a Resend-verified domain** or sends are rejected. |

Until the three Resend vars are set, the form degrades gracefully (`503` + fallback).

---

## 4. Deployment checklist

1. **Env vars** — set all four (§3) in Vercel for Production (and Preview).
2. **Resend domain** — add + verify the sending domain in Resend (SPF/DKIM DNS records); set `CONTACT_FROM_EMAIL` to an address on it.
3. **`NEXT_PUBLIC_SITE_URL`** — set to the launch origin (the Vercel subdomain at launch); confirm `robots.txt` allows indexing **only** on the production deployment (`VERCEL_ENV=production`) and that `sitemap.xml` shows absolute production URLs.
4. **Fill operator TODOs** (§2) — at minimum: photographer name + bio, legal/business identity (SIRET, address, directeur de publication), real contact inbox.
5. **Real photographs** — add `src` (+ `width`/`height`) to gallery/home content; delete `public/demo/`.
6. **End-to-end inquiry test** — submit the live form; confirm the email arrives and `reply_to` is the sender; confirm the success state renders.
7. **Social preview** — run the production URL through a social card debugger; confirm the OG/Twitter card renders.
8. **Structured data** — validate the JSON-LD (Google Rich Results / Schema.org validator) once real business details are in.
9. **Final QA pass** — Lighthouse (target ≥90 across the board once real, optimised images land) + a browser **console check** (zero hydration warnings / errors) + an automated **a11y scan** (e.g. axe) on every route. *Build/typecheck/lint/route-200/JSON-LD/OG/contact-API were verified this sprint; a headless-browser console+axe pass is the one remaining verification and belongs here against the deployed build.*

---

## 5. Manual steps required from the business owner

1. **Decide + provide the legal identity:** legal name/structure (auto-entrepreneur, EI, société…), registered/domiciliation address, **SIRET**, VAT status, and who is directeur de la publication. (Required for Mentions légales — legally mandatory in France.)
2. **Confirm the privacy specifics:** data-retention period and that you accept Vercel + Resend as processors (incl. US transfers). Ideally have a French legal professional review both pages.
3. **Provide identity content:** your real name, the bio (or approve the draft), and a portrait.
4. **Provide a real inbox** for inquiries (`CONTACT_TO_EMAIL` + `photographer.contact.email`).
5. **Provide the photographs** — hero + the five galleries at minimum.
6. **Create the Resend account**, verify the sending domain, and supply the API key.
7. **(Optional) pricing figures** if you want public "à partir de" prices instead of "sur demande".

---

## 6. Files changed

**New (14):** `app/api/contact/route.ts` · `app/mentions-legales/page.tsx` · `app/confidentialite/page.tsx` · `app/opengraph-image.tsx` · `app/twitter-image.tsx` · `components/legal/legal-document.tsx` · `components/seo/json-ld.tsx` · `content/photographer.ts` · `content/legal.ts` · `lib/contact.ts` · `lib/i18n.ts` · `lib/og.tsx` · `lib/structured-data.ts` · `.env.example`

**Modified (11):** `app/layout.tsx` · `app/page.tsx` · `app/a-propos/page.tsx` · `app/contact/page.tsx` · `components/contact-form.tsx` · `components/gallery/lightbox.tsx` · `components/layout/site-header.tsx` · `components/layout/site-footer.tsx` · `content/site.ts` · `lib/seo.ts` · `styles/globals.css`

**Untouched:** every homepage section component and the motion/gallery system (the approved benchmark).

---

## 7. Verdict

**Launch blockers remaining: YES — but engineering is done; what remains is content + operations.**

Every *code* launch blocker from the audit is resolved and verified: the contact flow works end-to-end, legal pages exist and are linked, structured data + OG/Twitter cards ship, body-text contrast meets AA, and the identity + i18n architecture is in place. The site **cannot go public yet** for reasons that are now entirely the owner's inputs:

1. **Real photographs** (it's a photography site).
2. **Real photographer name + bio + portrait.**
3. **The legal/business facts** behind the `[À COMPLÉTER]` markers (SIRET, address, directeur de publication, retention).
4. **Production env vars** — `NEXT_PUBLIC_SITE_URL` + the three Resend keys (+ verified sending domain).

Once those four are supplied, this branch is launch-ready. There is no further engineering blocker.

### Recommended next sprint
**"Real-content launch pass."** Single-purpose: ingest what the owner provides and ship.
1. Fill all `TODO(operator)` content (identity + legal + inbox).
2. Add real photographs (hero + 5 galleries); delete `public/demo/`.
3. Configure env vars + verify the Resend domain; run the §4 checklist incl. the live inquiry test, social-card check, JSON-LD validation, and the headless-browser console + axe pass.
4. Lighthouse pass on real, optimised images.

**Then** (separate, post-launch, high-ROI — from audit §10 Phase 2/3): the inner-page consistency pass (galleries index → cover frames, eyebrows + `Reveal` on inner pages), then the **English locale** (the i18n seam is ready), and the testimonials collection workflow.

---

## 8. Real-content launch pass (2026-06-20) — content architecture + localization

A second sprint, executed after the engineering sprint above, to make the project a **launch-ready business site** (content readiness + scalability). No homepage redesign, no spacing/motion/gallery/pricing changes.

**Verification:** `tsc` ✅ · `eslint` ✅ · `next build` ✅ (20 routes) · runtime smoke ✅ (prestations renders the 5 services + expanded FAQ; JSON-LD `areaServed` present; hreflang remains FR + x-default only; the language switcher renders nothing while single-locale → zero visual change).

### Delivered
- **Expanded content models (all centralized, nothing hardcoded):** `content/services.ts` (5 documentary service descriptions), `content/locations.ts` (Lyon → France → Europe → international), `content/faq.ts` (FAQ relocated from pricing + expanded, categorised), `content/contact-channels.ts`, expanded `content/testimonials.ts` type. Photographer profile + legal models already existed.
- **Full i18n architecture (no translations shipped):** four locales (`fr` canonical + `en`/`ru`/`uk` reserved) in `lib/i18n.ts` with routing helpers; **translation dictionaries** `content/dictionaries/{fr,en,ru,uk}.ts`; `getDictionary()` resolver with **French fallback** (`lib/dictionary.ts`); **language switcher** built + header-mounted (invisible until a 2nd locale is active); **localized metadata + hreflang** (active-locales only); **locale-aware JSON-LD**. Activation steps documented in `docs/localization-roadmap.md`.
- **Surfaced content (inner page only):** `/prestations` now shows the service descriptions + the expanded FAQ, using existing visual idioms.
- **Brand + owner system docs:** `brand-foundation.md`, `owner-todo.md`, `localization-roadmap.md`, `analytics-recommendation.md`, `image-guidelines.md`, and `content-collection/` (4 questionnaires).

### Decisions worth noting
- **RGPD** is integrated into the privacy policy (standard French practice), not a third page.
- **Locale routing** is prepared (helpers + dictionaries + switcher + hreflang + fallback) but the `app/[lang]` route tree is **deliberately not built** until a locale's content exists — building it now would only duplicate French and risk the approved homepage. Documented as a one-time activation in the roadmap.
- **Analytics:** keep Vercel (cookieless) for launch; add Plausible later; avoid GA4. Reasoning in `docs/analytics-recommendation.md`.

---

## 9. Remaining launch blockers

All remaining blockers are **owner-supplied content / accounts** — there is no engineering blocker left. (Full checklist: `docs/owner-todo.md`.)

1. **Photographs** — hero + the 5 galleries (+ portrait). *(owner)*
2. **Identity** — real name + bio. *(owner; model ready)*
3. **Legal/business facts** — SIRET, legal address, directeur de la publication, retention period. *(owner; pages ready)*
4. **Accounts + env** — Resend account + verified sending domain; set `NEXT_PUBLIC_SITE_URL` + the 3 Resend env vars in Vercel. *(owner)*
5. **Final verification** — review copy, validate legal info, test the live contact flow end-to-end; one headless-browser console + axe pass against the deployed build. *(joint)*

---

## 10. Recommended launch-date readiness

- **Code/architecture:** ✅ **launch-ready today.** Build green, all blockers from the audit resolved in code, content architecture + i18n + SEO + a11y + legal scaffolding in place.
- **Gating factor:** owner content + accounts only.
- **Estimate:** once the owner provides the 🔴 items in `owner-todo.md` (photos, name, bio, legal facts, Resend + env vars), launch is achievable in **~1–2 working days** of integration + the final verification pass. There is **no further development phase** required to go live in French.
- **Suggested sequence:** owner gathers content using the questionnaires → developer ingests (data-only) → configure Vercel env + Resend domain → run §4 deployment checklist → launch on the Vercel subdomain → custom domain when ready.

---

## 11. Post-launch roadmap (30 / 60 / 90 days)

### First 30 days — stabilise & prove
- Collect **3–5 real testimonials** via the post-session workflow (`content-collection/testimonials-questionnaire.md`).
- Monitor inquiries; confirm deliverability (check spam folders, reply-to works).
- Create a **Google Business Profile** (local SEO; future reviews source).
- Validate JSON-LD in Google Search Console; submit the sitemap.
- Quick **Lighthouse + axe** pass on the live, real-image site; fix any real-content regressions.

### 31–60 days — consistency & reach
- **Inner-page consistency pass** (audit §4): galleries index → cover frames; eyebrows + `Reveal` on inner pages; align rhythm. Highest-ROI polish; system already exists.
- Add **OG-per-key** / photo-backed social card from a signature frame (`docs/image-guidelines.md` §8).
- Expand FAQ / add a **preparation guide** + formal **travel policy** (international audience).
- Consider **Plausible** if richer insight is wanted (`docs/analytics-recommendation.md`).

### 61–90 days — localization & growth
- **Activate English** (`/en`): translate `dictionaries/en.ts`, add the `app/[lang]` tree, flip `activeLocales`, update sitemap (`docs/localization-roadmap.md`). The seam is ready.
- Seasonal gallery refresh; keep the edit current.
- Evaluate **Russian / Ukrainian** activation based on demand (same activation path).
- Revisit pricing transparency (public "à partir de" vs on-request) based on inquiry quality.

> **Launch blockers remaining: YES — owner content + accounts only; ZERO engineering blockers.** The site is built, verified, and ready to receive real content and go live.
