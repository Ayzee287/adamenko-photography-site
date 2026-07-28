# Analytics Recommendation

**Date:** 2026-06-20
**Status:** Research + recommendation. **Not implemented** beyond what already ships.
**Constraints:** GDPR-friendly · lightweight · easy to maintain.

---

## Update — 2026-07-28: conversions are now measured (D153)

The recommendation below still stands: Vercel Web Analytics, no GA4, Plausible only if
richer reporting is ever wanted. One thing has changed.

Until this date the setup counted **page views only**, so the site's single conversion —
someone actually sending an enquiry — was invisible, and could never be attributed to the
page the visitor came from. `components/forms/inquiry-form.tsx` now emits one
`inquiry_sent` event on a successful submit:

```ts
track("inquiry_sent", { origin, locale });
```

- **`origin`** is the attribution that was missing: `/contact`, a service dossier, a gallery.
- **The payload is dimensions only.** No name, email, message or free text — and
  deliberately not the séance type, because a successful submit clears `values` by design
  and reaching back into an enquiry's contents to improve a metric is not a trade worth
  making.
- **Still cookieless, still no consent banner**, on the same basis as the pageview data the
  privacy policy already documents. No new vendor, no new bytes: `track` ships inside the
  `@vercel/analytics` client that was already loaded, and is a no-op off Vercel.
- Fires once per submission, guarded by a ref as well as the effect dependency, so a
  double-invoked effect in development cannot double-count.

Read the events in the Vercel dashboard under **Analytics → Events**.

---

## TL;DR

**Keep the current setup for launch: Vercel Web Analytics (already wired, cookieless).** If/when you want richer, independent reporting, **add Plausible** as the primary product analytics. **Do not add Google Analytics** — it's the wrong fit for a small premium site under GDPR.

---

## What's already in place

`@vercel/analytics` is installed and mounted in the root layout. It is **cookieless**, collects no personal data requiring consent, and needs no banner. For a brochure-style photography site whose single goal is "read → inquire", this already answers the only questions that matter day one: how many visitors, which pages, where they come from.

The privacy policy (`content/legal.ts`) already documents this processing.

---

## Comparison

| Criterion | Vercel Web Analytics | Plausible | Umami | Google Analytics 4 |
|---|---|---|---|---|
| GDPR / cookieless | ✅ Cookieless, no consent banner | ✅ Cookieless, no consent banner, EU-hosted | ✅ Cookieless (self-host or cloud) | ⚠️ Needs consent banner + careful config; ongoing EU-transfer scrutiny |
| Weight | ✅ Tiny, first-party | ✅ ~1 KB script | ✅ ~2 KB script | ❌ Heavy; affects performance budget |
| Maintenance | ✅ Zero (in the platform) | ✅ Hosted, near-zero | ⚠️ Self-host = you run a DB/server; cloud = low | ⚠️ Complex UI, config drift |
| Cost | Included (free tier on Hobby; metered on Pro) | 💶 Paid (~€9/mo small sites) | ✅ Free self-host / paid cloud | Free (you pay in privacy/complexity) |
| Data ownership | Vercel | Plausible (EU) | ✅ You (self-host) | Google |
| Reporting depth | Basic (pages, referrers, vitals) | Good (goals, funnels, sources) | Good | Very deep (overkill here) |
| Best for | Launch baseline | Premium small business wanting clean, private insight | Teams wanting full data ownership | Large sites needing ad-tech integration |

---

## Recommendation & reasoning

1. **Launch on Vercel Web Analytics (no change).** It's already integrated, cookieless, zero-maintenance, and sufficient to see traffic and Web Vitals from day one. Nothing to do.

2. **Add Plausible when you want product insight** (goal tracking like "contact form submitted", referral breakdown, country splits for the international audience). It's GDPR-clean, EU-hosted, ~1 KB, consent-banner-free, and trivial to maintain — the right match for a premium, privacy-respecting brand. Implementation later is a single `<Script>` tag + (optionally) a goal event on the contact success state.

3. **Avoid Google Analytics 4.** It would force a cookie-consent banner (friction on a calm, premium site), add real page weight, carry ongoing EU data-transfer scrutiny, and give you far more complexity than a photography brochure needs. The only reason to choose GA4 — deep ad-tech integration — does not apply here.

4. **Umami** is a fine alternative to Plausible **only if you want to self-host** and own the data outright. For this owner, the maintenance burden (a database + uptime) outweighs the benefit; the Plausible (or Umami **cloud**) hosted route is the lighter path.

---

## If/when Plausible is added (future, not now)

- Add the script for the production domain only.
- Define one goal: **Contact form submitted** (fire on the form's success state).
- Add a one-line mention to the privacy policy (`content/legal.ts`) — still cookieless, still no banner.
- Keep or drop Vercel Analytics; running both briefly is harmless.

No action required for launch.
