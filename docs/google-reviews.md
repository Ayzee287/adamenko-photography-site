# Google reviews → testimonials

How the real Google Business reviews reach the homepage Testimonials section, and
how to refresh them. The site stays **fully static**: the build never talks to
Google; reviews are synced on demand, reviewed like any content change, and
committed.

## Architecture

```
Google Business profile
        │  (Places API (New) — GET place?languageCode=<loc>, once per active locale,
        │   fieldmask: rating,userRatingCount,reviews)
        ▼
scripts/sync-reviews.mjs          ← run on demand: npm run sync:reviews
        │  merges the per-locale responses by review id → original + translations
        ▼
src/content/reviews.generated.ts  ← AUTO-GENERATED, committed (data)
        │  import
        ▼
src/content/testimonials.ts       ← hand-written editorial policy (curation)
        │  import
        ▼
components/home/testimonials.tsx  ← renders the list; per-card Google attribution
                                     + "view original / view translation" toggle
```

Design decisions:

- **No runtime fetching, no iframe, no widget.** Reviews are data in the content
  graph, statically rendered (SSG preserved, zero new client JS beyond the existing
  island, zero CLS on load).
- **Data vs policy split.** The generated file is verbatim and never hand-edited;
  which reviews *render* is decided in `testimonials.ts` (`MIN_RATING`,
  `EXCLUDED`). Curation never loses data. There is no length ceiling: long
  reviews render complete, visually clamped by the card's "read more" toggle.
- **Original preserved, translation offered (Google-Maps behaviour).** The sync
  keeps each review's `originalText` verbatim **and** Google's machine translation
  into every active site locale where the original differs (`translations`, keyed by
  locale). The card shows the translation in the visitor's language by default with
  a **"view original"** toggle back to the exact words the client wrote; the swap is
  client-only (both strings ship in the props — no network, no reload) and the body
  height eases between the two lengths (reduced-motion → instant). A review already
  in the visitor's language shows its original and hides the toggle. Nothing is ever
  discarded, and the toggle always falls back to `originalText`.
- **Per-card source attribution.** Each Google card carries a quiet "Avis Google" /
  "Google Reviews" line under the stars (the small official Google mark + localized
  wording, in the site's own meta type) so a visitor sees these are real Google
  reviews — understated, not a badge.
- **Verify on Google.** The sync also captures the official Google Maps deep-links
  (`googleProfile`, from the Places API `googleMapsLinks` field): the aggregate rating
  line links to the profile and a secondary text CTA ("Voir tous les avis sur Google" /
  "View all reviews on Google", the site's own clay-underline + arrow) opens the reviews
  list — where a visitor can verify authenticity or leave their own review — in a new tab.
  No section eyebrow: the heading stands on its own, with trust carried by the attribution
  and these links.
- **No timestamps in the output** — identical input produces an identical file, so
  diffs are honest and git history is the sync log.

## Credentials (one-time setup — done)

The script needs two values, read from the environment or `.env.local`
(script-only — the Next runtime never reads them, so they are **not** needed on
Vercel):

| Variable | What it is | This project |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | A Google Maps Platform API key with **Places API (New)** enabled | Reuses the existing key **"Maps Platform API Key"** in the Google Cloud project `adamenko-photography` (API-restricted to the Maps APIs, which include Places API (New)). |
| `GOOGLE_PLACE_ID` | The business's Place ID | `ChIJf1b8fdnMDiMRSk52HrLiTVw` |

Both are set in `.env.local` (git-ignored). To reproduce from scratch:

1. In [Google Cloud Console](https://console.cloud.google.com/): create (or pick) a
   project → *APIs & Services* → enable **Places API (New)** → *Credentials* →
   create (or reuse) an **API key**. Restrict it to the Maps/Places APIs. Enabling
   Places API (New) requires the project to have **billing** attached; Places
   Details calls are billed per request, but one request per sync is far inside the
   monthly free tier.
2. **Find the Place ID.** Adamenko Photography is a **Service Area Business** — it
   has no public storefront address, so it does **not** appear in the JavaScript
   [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
   (that widget only surfaces places with an address). Discover it instead with a
   **Places API (New) Text Search** using the SAB opt-in flag:

   ```
   curl -s -X POST 'https://places.googleapis.com/v1/places:searchText' \
     -H "X-Goog-Api-Key: $GOOGLE_PLACES_API_KEY" \
     -H "X-Goog-FieldMask: places.id,places.displayName,places.pureServiceAreaBusiness" \
     -H 'Content-Type: application/json' \
     -d '{"textQuery":"Adamenko Photography Lyon","includePureServiceAreaBusinesses":true}'
   ```

   The matching result has `pureServiceAreaBusiness: true`; take its `id`.
3. Put both in `.env.local` (already git-ignored).

## Update workflow

Whenever new reviews should appear on the site (a monthly pass is plenty, and also
keeps the display within Google's content-freshness expectations):

```
npm run sync:reviews      # rewrites src/content/reviews.generated.ts
git diff                  # read the new words — this is a content review
```

- Want to hide a specific review? Add its `id` to `EXCLUDED` in
  `src/content/testimonials.ts`.
- Commit both files, push, deploy. Done — the build itself needs no credentials
  and cannot fail because of Google.

Failure handling (all verified):

- Missing credentials, HTTP error, malformed payload → the script exits non-zero
  **without touching the generated file**; the last-known-good reviews keep
  shipping.
- A response with zero reviews refuses to overwrite a non-empty file unless
  `--allow-empty` is passed — a Google-side glitch can't silently wipe real words.
- Offline dry-run: `node scripts/sync-reviews.mjs --fixture <response.json>` runs
  the exact mapping + emit path against a canned Places API response.

## Known limits & upgrade path

- **Places API (New) returns at most the 5 "most relevant" reviews** for a place,
  not the full list, and the selection is Google's. For a quiet testimonial
  carousel this is a good trade: simple key auth, no approval process, a couple of
  requests per sync (one per active locale, for the translations). Reviews cannot be
  answered/managed through this API.
- If the profile grows and the *full* review list is wanted, the upgrade is the
  **Google Business Profile API** (`mybusiness.googleapis.com` v4 reviews list):
  full pagination and replies, but it requires OAuth as the profile owner *and*
  Google's per-project API access approval (a request form, days–weeks). The
  pipeline is already shaped for it — only `fetchPlace()`/the mapping inside
  `sync-reviews.mjs` would change; the typed model, the curation layer and the
  component stay as they are.
- **Attribution:** each card renders the reviewer's published name (the substance of
  Google's author-attribution guidance) **and** a per-card "Avis Google" /
  "Google Reviews" line with the official Google mark, driven by the `source:
  "google"` field. The aggregate rating line under the carousel names Google too.
