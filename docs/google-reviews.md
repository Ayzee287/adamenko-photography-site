# Google reviews → testimonials

How the real Google Business reviews reach the homepage Testimonials section, and
how to refresh them. The site stays **fully static**: the build never talks to
Google; reviews are synced on demand, reviewed like any content change, and
committed.

## Architecture

```
Google Business profile
        │  (Places API (New) — GET place, fieldmask: rating,userRatingCount,reviews)
        ▼
scripts/sync-reviews.mjs          ← run on demand: npm run sync:reviews
        │  maps to the typed shape, newest first, original language kept
        ▼
src/content/reviews.generated.ts  ← AUTO-GENERATED, committed (data)
        │  import
        ▼
src/content/testimonials.ts       ← hand-written editorial policy (curation)
        │  import
        ▼
components/home/testimonials.tsx  ← untouched — renders whatever the list holds
```

Design decisions:

- **No runtime fetching, no iframe, no widget.** Reviews are data in the content
  graph, statically rendered (SSG preserved, zero new client JS, zero CLS).
- **Data vs policy split.** The generated file is verbatim and never hand-edited;
  which reviews *render* is decided in `testimonials.ts` (`MIN_RATING`,
  `EXCLUDED`). Curation never loses data. There is no length ceiling: long
  reviews render complete, visually clamped by the card's "read more" toggle.
- **Original words only.** The sync keeps each review's `originalText` (never
  Google's machine translation) — the same "real words only, verbatim" rule the
  testimonials section has always had. Reviews render identically in both locales,
  in the language they were written in.
- **No timestamps in the output** — identical input produces an identical file, so
  diffs are honest and git history is the sync log.

## Credentials (one-time setup)

The script needs two values, read from the environment or `.env.local`
(script-only — the Next runtime never reads them, so they are **not** needed on
Vercel):

| Variable | What it is |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | A Google Maps Platform API key with **Places API (New)** enabled |
| `GOOGLE_PLACE_ID` | The business's Place ID |

1. In [Google Cloud Console](https://console.cloud.google.com/): create (or pick) a
   project → *APIs & Services* → enable **Places API (New)** → *Credentials* →
   create an **API key**. Restrict the key to the Places API (New) only. Places
   Details calls are billed per request, but one request per sync is far inside the
   monthly free tier.
2. Find the Place ID with Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
   (search for the business by name).
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
  carousel this is a good trade: simple key auth, no approval process, one request
  per sync. Reviews cannot be answered/managed through this API.
- If the profile grows and the *full* review list is wanted, the upgrade is the
  **Google Business Profile API** (`mybusiness.googleapis.com` v4 reviews list):
  full pagination and replies, but it requires OAuth as the profile owner *and*
  Google's per-project API access approval (a request form, days–weeks). The
  pipeline is already shaped for it — only `fetchPlace()`/the mapping inside
  `sync-reviews.mjs` would change; the typed model, the curation layer and the
  component stay as they are.
- **Attribution:** each quote renders with the reviewer's published name, which is
  the substance of Google's author-attribution guidance. If the owner ever wants
  an explicit "avis Google" source label near the section title, that is a copy
  decision for a later pass — the `source: "google"` field is already tracked per
  testimonial.
