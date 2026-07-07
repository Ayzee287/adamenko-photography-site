# Google reviews → testimonials

How the real Google Business reviews reach the homepage Testimonials section, and
how they stay fresh. The site stays **fully static**: the build never talks to
Google. Reviews are synced **automatically** by a scheduled GitHub Action (no local
machine, no "remember to run sync"); the sync's output is committed as plain data
and Vercel redeploys. A manual sync is still available for anyone who wants it.

## Architecture

```
        ┌─────────────────────  GitHub Actions (.github/workflows/sync-reviews.yml)
        │                        cron: daily 05:23 UTC  ·  or manual (workflow_dispatch)
        ▼
Google Business profile
        │  (Places API (New) — GET place?languageCode=<loc>, once per active locale,
        │   fieldmask: rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks)
        ▼
scripts/sync-reviews.mjs          ← runs in CI (or locally: npm run sync:reviews)
        │  merges the per-locale responses by review id → original + translations
        │  + aggregate rating + official profile links; NO timestamps (deterministic)
        ▼
src/content/reviews.generated.ts  ← AUTO-GENERATED data
        │
        │  the workflow: if this file changed → commit ONLY it, push to the default
        │  branch → Vercel redeploys. If nothing changed → no commit, no deploy.
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
3. Put both in `.env.local` (already git-ignored) for local runs.
4. **For the automatic sync, add the same two values as GitHub repository secrets**
   so the scheduled Action can use them: GitHub → the repo → *Settings* → *Secrets
   and variables* → *Actions* → *New repository secret*, twice:

   | Secret name | Value |
   | --- | --- |
   | `GOOGLE_PLACES_API_KEY` | the Maps Platform API key (same value as `.env.local`) |
   | `GOOGLE_PLACE_ID` | `ChIJf1b8fdnMDiMRSk52HrLiTVw` |

   The names must match exactly — the workflow reads `secrets.GOOGLE_PLACES_API_KEY`
   and `secrets.GOOGLE_PLACE_ID`. Secrets are write-only in the UI and never printed
   in logs. (The Next runtime still never reads these — they are sync-only.)

## Automatic sync (production)

Reviews stay fresh with **no manual work**. The workflow
`.github/workflows/sync-reviews.yml` runs on a schedule, regenerates
`reviews.generated.ts`, and — only if something changed — commits that one file and
pushes, which triggers a Vercel redeploy.

**Schedule:** daily at **05:23 UTC** (early morning in Lyon, so a review left
overnight is live by the owner's morning). The odd minute dodges GitHub's
top-of-hour scheduler backlog. Daily (rather than weekly) is the default because
reviews are conversion-critical social proof and the cost is negligible (below); to
go weekly instead, change the cron to `"23 5 * * 1"`. A scheduled workflow only runs
from the file on the **default branch**, so this activates once the workflow is
merged to `main`.

**What the workflow does, step by step:**

1. Checks out the default branch (with push credentials from the built-in
   `GITHUB_TOKEN`, scoped to `contents: write`).
2. Sets up Node 20. It does **not** `npm install` — the sync script uses only Node
   built-ins (`node:fs`, `node:path`, global `fetch`), so there's nothing to install.
3. Runs `npm run sync:reviews` with the two secrets as env vars.
4. If `git diff` shows `reviews.generated.ts` changed, it stages **only** that file,
   commits it (`chore(reviews): sync Google reviews from Places API`) and pushes. If
   nothing changed, it exits cleanly with **no commit and no deploy**.

**Why push straight to `main` (not a PR):** the goal is zero manual intervention, and
a PR would need a human to merge. Direct push is safe here because (a) the payload is
a single machine-generated data file, (b) the sync is deterministic and guards
against wiping real words with an empty response, (c) the workflow stages only that
one path, so a commit can never include anything else, and (d) it re-checks the file
still looks well-formed before committing. *If you ever protect `main` so the Actions
bot cannot push directly, either grant that bot an exception or switch the last step
to open a PR — but then merging becomes manual.*

**No infinite loops / idempotent:** the workflow is triggered by `schedule` and
`workflow_dispatch` only — **never by `push`** — so its own commit cannot re-trigger
it. The commit message deliberately omits `[skip ci]` (Vercel skips such commits),
so the deploy still happens. Because the sync emits no timestamps, an unchanged
profile yields a byte-identical file → no diff → no commit; running twice in a row
is a no-op.

**Trigger a manual sync** (no local machine needed): GitHub → the repo → *Actions* →
*Sync Google reviews* → *Run workflow*. It behaves exactly like a scheduled run
(commits only if something changed). Locally you can still run:

```
npm run sync:reviews      # rewrites src/content/reviews.generated.ts
git diff                  # read the new words, then commit that file
```

**Curation:** to hide a specific review, add its `id` to `EXCLUDED` in
`src/content/testimonials.ts` (hand-written; the sync never touches it).

### Failure handling & recovery (all verified)

- **Google unavailable / bad credentials / malformed payload** → the sync exits
  non-zero **without touching the generated file**. The workflow step fails, so the
  commit steps never run and the repository is left exactly as it was; the site keeps
  serving the last-known-good reviews. The **next scheduled run recovers
  automatically** (or trigger a manual run). Nothing to clean up.
- **Zero-reviews glitch** → the script refuses to overwrite a non-empty file unless
  `--allow-empty` is passed, so a transient Google glitch can't silently wipe real
  words.
- **A rejected push** (e.g. `main` advanced mid-run) fails the job cleanly and
  self-heals on the next run (the sync is deterministic). A `concurrency` group also
  prevents two syncs from racing.
- **Offline dry-run** of the mapping/emit path (no network, no creds):
  `node scripts/sync-reviews.mjs --fixture <response.json>`.

### Cost (Places API)

Each sync makes **one Place Details request per active locale**. With `fr` + `en`
that is **2 requests per sync**. Daily → **~60 requests/month** (weekly → ~8/month).
These use the Places API (New) *Place Details* SKU that includes the reviews field;
at ~60 calls/month the cost is a few cents and sits **comfortably inside the free
monthly usage** (the Google Maps Platform free tier alone covers many thousands of
such calls per month). Enabling a slightly higher cadence would still be trivial —
this pipeline is nowhere near any quota.

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
