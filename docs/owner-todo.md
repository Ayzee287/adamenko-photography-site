# Owner To-Do — Before Launch

**For:** the photographer / business owner
**Date:** 2026-06-20 · **Updated:** 2026-06-24

> **Update 2026-06-24 — several blockers cleared.** Confirmed business facts + facts
> recovered from your previous website were ingested, so these are now **done in code**:
> your **name** (Irina Adamenko), professional **e-mail** (adamenkoiu@gmail.com), legal
> **identity + SIRET + address** (EI, 979 493 327 00014, 173 av. Barthélemy Buyer, 69005
> Lyon), **directeur de la publication**, and the **Facebook + Telegram** channels. Your
> **bio** was rewritten in your own words (durable facts only) but is still a **draft to
> confirm**. What remains for you is below, with the cleared rows struck through. See
> `docs/original-site-recovery.md` for everything recovered.

Everything below is **content, business information, or an account** that only you can provide. The website itself is built and verified — once these are filled in, it can go live. Items are grouped and marked by priority:

- 🔴 **Blocker** — the site can't responsibly launch without it.
- 🟠 **Important** — launch is possible without it, but do it soon after (or before, if easy).
- 🟢 **Nice to have** — improves the site; no rush.

Where a task maps to a file, the developer fills the file from your answers — you don't edit code.

---

## A. Content

> **Update 2026-06-25 — your real photographs are now LIVE in the site** (you authorized using the
> recovered work). Hero, all five galleries, the About portrait, the homepage reel, the séance spreads and
> the social card now use your actual photos. The only photo task left is **optional**: send **hi-res
> masters** to replace the web-sized recovered versions (≤1280px), and reconfirm consent for any clients you
> want featured. Cleared rows are struck through below.

| # | Task | Priority | Where it goes | Notes |
|---|---|---|---|---|
| ~~A1~~ | ~~**Hero photograph**~~ | ✅ live | `content/home.ts` | Using your wedding-terrace frame. Send a **hi-res** master to upgrade (optional). |
| ~~A2~~ | ~~**Gallery photographs** — 5 genres~~ | ✅ live | `content/galleries.ts` + `public/galleries/<genre>/` | 37 curated frames placed (familles 9 · grossesse 8 · couples 7 · portraits 5 · mariages 9). Optional: hi-res masters + extra Portraits frames. |
| ~~A3~~ | ~~**Your portrait**~~ | ✅ live | `content/photographer.ts` | Your B&W film-camera portrait is on the About page + homepage. Send a hi-res copy to upgrade (optional). |
| ~~A4~~ | ~~**Your name**~~ | ✅ done | `content/photographer.ts` | Set to **Irina Adamenko** (legal "Irina Adamenko (Sereda)" on legal pages). |
| A5 | **Your biography** — confirm the draft | 🟠 | `content/photographer.ts` (`biography`) | Now a **draft in your own words** (Ukrainian, Lyon, ex-lawyer, mother of three, documentary approach). Dating figures were removed (they'd be stale). Confirm wording; optionally restore a current timeframe. |
| A6 | **Service descriptions** — confirm/adjust the drafts | 🟠 | `content/services.ts` | Drafts exist; confirm they sound like you. Questionnaire provided. |
| A7 | **Testimonials** — 3–5 real client quotes | 🟠 | `content/testimonials.ts` | Real only. Collection flow in `docs/content-collection/testimonials-questionnaire.md`. |
| A8 | **FAQ** — confirm/expand | 🟢 | `content/faq.ts` | Drafts exist; add anything clients ask you often. |
| A9 | **Pricing figures** (optional) | 🟢 | `content/pricing.ts` (`priceFrom`) | Leave unset to keep "Tarif sur demande". **Your 2023 rates were recovered** (Famille/Couple/Grossesse 250 €; Mariage 650/1000/1300 €) — confirm/update if you want public "à partir de" pricing. See `docs/original-site-recovery.md` §4. |
| ~~A10~~ | ~~**Remove temporary demo images**~~ | ✅ done | — | `public/demo/` deleted (2026-06-25). |

---

## B. Business & legal information

Required for the legally mandatory **Mentions légales** and **Politique de confidentialité** (`content/legal.ts`). All currently show `[À COMPLÉTER]` placeholders.

| # | Task | Priority | Notes |
|---|---|---|---|
| ~~B1~~ | ~~**Legal name + structure**~~ | ✅ done | **Irina Adamenko (Sereda), entrepreneur individuel (EI)** — on the Mentions légales. |
| ~~B2~~ | ~~**SIRET number**~~ | ✅ done | **979 493 327 00014** (APE 74.20Z). |
| ~~B3~~ | ~~**Legal / domiciliation address**~~ | ✅ done | **Bât. 1, 173 av. Barthélemy Buyer, 69005 Lyon** — verify it's the address you want public. |
| B4 | **VAT status** — confirm | 🟠 | Defaulted to **"TVA non applicable, art. 293 B du CGI"** (the franchise mention, standard for an EI). If you are VAT-registered, replace with your intra-EU VAT number (`content/legal.ts`). |
| ~~B5~~ | ~~**Directeur de la publication**~~ | ✅ done | Irina Adamenko (from the identity model). |
| ~~B6~~ | ~~**Contact email**~~ | ✅ done | **adamenkoiu@gmail.com** — used for the form delivery target + fallback link. Verify it's the inbox you want inquiries in. |
| B7 | **Phone number** (optional, public) | 🟢 | → `content/photographer.ts` (`contact.phone`). |
| B8 | **Data-retention period** for inquiries | 🟠 | e.g. 3 years after last contact (CNIL guidance). Used in the privacy policy. |
| B9 | **Legal review** of both legal pages | 🟠 | Ideally a French legal professional confirms the final text (esp. the VAT mention). |
| B10 | **Confirm Telegram is active** | 🟢 | `t.me/AdamenkoIr` was recovered from your old site + added as a contact channel. Remove it if no longer used (`content/photographer.ts`). |

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

**Remaining 🔴 after the 2026-06-25 update:** C2 Resend account + verified sending domain · C3 Vercel env vars · D1–D3 verification (read the copy, validate the legal details, test the contact flow end-to-end).

✅ **Cleared:** A1 hero · A2 galleries · A3 portrait · A10 demo removal · A4 name · A5 bio (now a draft to confirm, 🟠) · B1–B3 legal identity · B5 directeur · B6 email.

**The launch now hinges on operations only** — the Resend e-mail account, the Vercel import + env vars, and a final read-through. The content, identity, photographs and legal text are in place. Optional polish (hi-res photo masters, real testimonials, pricing figures, English) can all follow after launch.
