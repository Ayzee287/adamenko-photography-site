# Owner To-Do — Before Launch

**For:** the photographer / business owner
**Date:** 2026-06-20

Everything below is **content, business information, or an account** that only you can provide. The website itself is built and verified — once these are filled in, it can go live. Items are grouped and marked by priority:

- 🔴 **Blocker** — the site can't responsibly launch without it.
- 🟠 **Important** — launch is possible without it, but do it soon after (or before, if easy).
- 🟢 **Nice to have** — improves the site; no rush.

Where a task maps to a file, the developer fills the file from your answers — you don't edit code.

---

## A. Content

| # | Task | Priority | Where it goes | Notes |
|---|---|---|---|---|
| A1 | **Hero photograph** | 🔴 | `content/home.ts` (`hero.image`) | One strong opening frame, landscape, high-res. |
| A2 | **Gallery photographs** — the 5 genres (Familles, Couples, Grossesse, Mariages, Portraits) | 🔴 | `content/galleries.ts` + `public/galleries/<genre>/` | ~6–12 culled, graded, web-exported per genre. See `docs/image-guidelines.md`. |
| A3 | **Your portrait** (for the About page) | 🔴 | `content/photographer.ts` + about page | A natural, direct portrait — 4:5. |
| A4 | **Your name** | 🔴 | `content/photographer.ts` (`name`) | The personal name shown on About + in structured data. |
| A5 | **Your biography** | 🔴 | `content/photographer.ts` (`biography`) | Use the questionnaire in `docs/content-collection/biography-questionnaire.md`. |
| A6 | **Service descriptions** — confirm/adjust the drafts | 🟠 | `content/services.ts` | Drafts exist; confirm they sound like you. Questionnaire provided. |
| A7 | **Testimonials** — 3–5 real client quotes | 🟠 | `content/testimonials.ts` | Real only. Collection flow in `docs/content-collection/testimonials-questionnaire.md`. |
| A8 | **FAQ** — confirm/expand | 🟢 | `content/faq.ts` | Drafts exist; add anything clients ask you often. |
| A9 | **Pricing figures** (optional) | 🟢 | `content/pricing.ts` (`priceFrom`) | Leave unset to keep "Tarif sur demande". |
| A10 | **Remove temporary demo images** | 🟠 | `public/demo/` | Now unreferenced; delete before launch. |

---

## B. Business & legal information

Required for the legally mandatory **Mentions légales** and **Politique de confidentialité** (`content/legal.ts`). All currently show `[À COMPLÉTER]` placeholders.

| # | Task | Priority | Notes |
|---|---|---|---|
| B1 | **Legal name + structure** (micro-entrepreneur, EI, etc.) | 🔴 | Shown as the éditeur du site. |
| B2 | **SIRET number** | 🔴 | Mandatory for a registered French business. |
| B3 | **Legal / domiciliation address** | 🔴 | May be a domiciliation address, not your home. |
| B4 | **VAT status** | 🟠 | Either an intra-EU VAT number, or the "TVA non applicable, art. 293 B du CGI" mention. |
| B5 | **Directeur de la publication** | 🔴 | Usually you. |
| B6 | **Contact email** (real inbox) | 🔴 | Drives the contact form delivery + the fallback link. → `content/photographer.ts` (`contact.email`). |
| B7 | **Phone number** (optional, public) | 🟢 | → `content/photographer.ts` (`contact.phone`). |
| B8 | **Data-retention period** for inquiries | 🟠 | e.g. 3 years after last contact (CNIL guidance). Used in the privacy policy. |
| B9 | **Legal review** of both legal pages | 🟠 | Ideally a French legal professional confirms the final text. |

---

## C. Infrastructure & accounts

| # | Task | Priority | Notes |
|---|---|---|---|
| C1 | **Domain** | 🟠 | Launch can run on the Vercel subdomain; a custom domain can follow. When ready, set `NEXT_PUBLIC_SITE_URL` and add the domain in Vercel. |
| C2 | **Resend account** + **verified sending domain** | 🔴 | For contact-form delivery. Create at resend.com, verify the domain (SPF/DKIM DNS), get the API key. |
| C3 | **Environment variables in Vercel** | 🔴 | `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (Production + Preview). See `.env.example`. |
| C4 | **Analytics** | 🟢 | Vercel Web Analytics is already wired (cookieless). See `docs/analytics-recommendation.md` before adding anything else. |
| C5 | **Google Business Profile** (optional) | 🟢 | Independent local-SEO value; future source for reviews. |

---

## D. Verification (do these on the live/preview site before announcing)

| # | Task | Priority | Notes |
|---|---|---|---|
| D1 | **Review all copy** | 🔴 | Read every page as a client would; confirm it sounds like you. |
| D2 | **Validate the legal information** | 🔴 | No `[À COMPLÉTER]` left; details correct. |
| D3 | **Test the contact flow end-to-end** | 🔴 | Submit a real inquiry; confirm the email arrives and you can reply to the sender. |
| D4 | **Check photos on phone + desktop** | 🟠 | Orientation, crop, and tone read well on both. |
| D5 | **Check the social preview** | 🟢 | Paste the URL into a social card debugger; confirm the card renders. |
| D6 | **Confirm indexing** | 🟠 | Only the production site should be indexable (already configured); confirm `robots.txt` + `sitemap.xml` look right once `NEXT_PUBLIC_SITE_URL` is set. |

---

## Minimum set to launch (the 🔴 list)

A1 hero · A2 galleries · A3 portrait · A4 name · A5 bio · B1–B3 legal identity · B5 directeur · B6 email · C2 Resend + domain · C3 env vars · D1–D3 verification.

Everything else can follow after launch without holding it back.
