# Gallery re-cut — 2026-08-01

Irina reviewed the live site on 31/07 and sent seven annotated screenshots. This is what
was changed, what it broke, and what is still waiting on her.

---

## What she asked for, and what was done

| # | Her note | Album | Done |
|---|---|---|---|
| 1 | «Эту фотку надо удалить с сайта» | `mariages-1` | Opening frame `096A1687.jpg` dropped — a crew member is crouching in the bottom-left of the frame. 23 → 22 frames. |
| 2 | «Первая семья … они не давали разрешение на публикацию» | `familles-2` «Tout petit» | `visibility: private`. Exports **deleted** from `public/stories/`. Source kept in the library for private delivery. |
| 3 | «вместо этой загрузить серию с рыжей собакой» | new `familles-5` | 50 frames from `Documents\1\Familles\5`, published as «La maisonnée». |
| 4 | «вторая и третья папки поменять аватарки» | `familles-1`, `familles-3` | New covers `096A8881.jpg` and `326A9046.jpg` — both frames she pointed at. |
| 5 | «и на четвертой тоже другой аватар» | `familles-4` | New cover `326A4066.jpg`. |
| 6 | «там с велосипедом ты не добавил ни одной» | `familles-3` | The 9 Vélo'v frames she had added to `Documents\1\Familles\3` were not yet in the story library. Copied in and placed after `326A9627`, where they fall chronologically. 70 → 79 frames. |
| 7 | «На главную / В папке» | `grossesse-2` | New cover `096A6369.jpg` — the symmetrical arcade-and-statue frame. |
| 8 | «белье просвечивает, нельзя публиковать» | `grossesse-1` | 28 frames dropped. See below. |

## The maternity cut is much larger than the frames she circled

She screenshotted one run. The garment is the same through most of the séance, so the rule
was applied to the whole story rather than to the screenshots: **any frame in which the
breast is discernible through the sheer lace was removed.** That is 28 of 39 frames.

Kept (11): `096A6951-2`, `096A7029`, `096A7250`, `096A7278`, `096A7306-2`, `096A7410`,
`096A7415`, `096A7417`, `096A7426`, `096A7446`, `096A7466`.

The remainder still reads as a story — reclining, the window, a detail, foreheads together,
then the white-dress sequence — but it is short, and about half of it is that one closing
sequence. **This is worth a decision from Irina:** keep the 11, re-cut from the originals,
or withdraw the séance the way «Tout petit» was withdrawn.

Every dropped frame is `#`-commented in `story.txt` with the reason, so nothing is lost and
the sheet explains itself to the next person who opens it.

---

## What the re-cut broke, and what to watch on the next one

`stories-build.mjs` names exports by POSITION — `<slug>-NN.jpg`. Removing a frame from the
middle of a story therefore **renumbers every frame after it, and a filename keeps pointing
at a different photograph.** Two consequences, both of which bit during this change:

**1. Hard-coded frame paths silently change meaning.** `home.ts` pointed the Grossesse tile
at `grossesse-1-12.jpg`; after the cut that file does not exist. Fixed by aiming it at
`grossesse-1-05.jpg`. Anything referencing a story frame by number must be re-checked after
a re-cut — the current list lives in `gen-blur.mjs`'s `ALWAYS_INCLUDE`, plus `home.ts`,
`en.ts`, `gallery-covers.ts` and `service-dossier.ts`.

**2. Caches keyed on the URL keep serving the withdrawn photograph.** `next.config.ts` sets
`minimumCacheTTL: 2678400` (31 days) on the explicit assumption that *"a new export gets a
new `<genre>-NN.jpg` name, so a stale-after-swap window never arises"*. That assumption is
false for a re-cut. Observed locally: after rebuilding, `/galeries/grossesse/grossesse-1`
still rendered the removed see-through frames — first from `.next/cache/images`, then, after
deleting that, from the browser's own 31-day copy. Only a cache-bypassing reload showed the
real page.

This is not merely cosmetic: frames get dropped here for **consent and decency** reasons, and
a cache that keeps serving a recycled URL keeps publishing the photograph that was withdrawn.

Until exports carry a content hash in their filename, treat any release that removes or
reorders frames mid-story as needing a deliberate cache purge:

* purge the Vercel image-optimization cache for the affected paths after deploying;
* verify the live pages with a cache-bypassing reload, never a normal one;
* `familles-2`'s URLs now 404, which is correct — but a client holding a cached copy may
  still show those photographs until its own TTL expires.

**Recommended permanent fix:** give each export a short content hash
(`<slug>-NN.<hash8>.jpg`). `stories-build.mjs` already computes the source hash for
idempotency, so it is a one-line change in `publishPhotos()` — but it renames every file
under `public/stories/`, so it wants its own commit rather than riding along with an
editorial change.

---

## Consistency changes made alongside

* **`/galeries` Familles plate** → `familles-3-55.jpg` (the three of them at the Vélo'v
  stand). The default plate was `familles-a00`, the same family at the same fountain as the
  new `familles-3` cover, so the index and the first card behind it read as one photograph
  shown twice. This also puts the bicycle sequence on the front of the site.
* **EN homepage re-synced with FR.** `seances.scenes` is an array, so `en.ts` replaces the
  French list wholesale rather than merging into it — and it had quietly drifted back to the
  two frames the French page deliberately moved away from (`grossesse-a00`, the /galeries
  cover shown twice; `couples-a07`, a wedding photograph standing in for a couple séance).
  Both now match FR, with English alt text.

---

## Open — waiting on Irina

1. **Maternity séance** — 11 frames is thin. Keep, re-cut, or withdraw?
2. **Alt text.** Every story frame carries a positional placeholder (`«Titre» — 7 / 22`)
   rather than a description. It is consistent, and it is not accessible or useful to search.
   The curated genre galleries in `curation/collections.txt` show what real alt text looks
   like. ~1 000 lines, so it wants a plan rather than a sitting.
3. **`familles-3` has a frame literally named `ч.jpg`** (a single Cyrillic character). It
   works, but it is a mis-named export and will confuse the next person; rename at source.
4. **Duplicate mono/colour openings.** Several stories — `familles-5` among them — open with
   the same frame twice, once black-and-white and once in colour (the `-2` suffix pairs).
   As an opening it reads as a mistake rather than a choice. Worth re-ordering so the pair
   sits mid-story, or dropping one.
