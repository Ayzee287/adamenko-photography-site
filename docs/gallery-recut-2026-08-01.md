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

---

# Editorial pass — 2026-08-01 (second sitting)

The review in the Editorial Pass artifact, applied. **987 → 482 frames** across sixteen
galleries. Every removal has a reason recorded in the story's own `story.txt`; nothing was
cut to reach a number.

## The four faults, and what closed them

**Duplicated instants.** All 64 mono/colour twins are gone — decided one by one from
side-by-side sheets rather than by rule, because the `-2` suffix is *not* consistently the
mono version. Colour won almost everywhere: the palettes are what make these galleries
cohere. Two exceptions kept the black-and-white (`couples-2` on the steps, where the
graphic reading is stronger; `familles-1`'s dark feet, where the `-2` *was* the colour).

**Openings.** Six galleries opened on a duplicate pair or an unreadable frame. All six now
open on a photograph that states the story: `familles-5` on the dog looking down the lens,
`familles-1` on the big sister beside the newborn, `couples-2` on the white gate,
`couples-4` on the avenue of benches, `familles-4` on the lake in mist, `grossesse-3` on
the overhead in the grass. `mariages-3`'s unreadable detail was simply removed, promoting
the ceremony to first position.

**Endings.** Nine galleries now close on a chosen frame rather than on a repeat:
`couples-1` on the footbridge silhouette, `couples-3` on the postcard held against the bay,
`couples-4` on the lit archway, `grossesse-2` on the vaulted corridor, `grossesse-4` on the
white dress outdoors, `familles-3` on the walk away down the street, `familles-4` on the
horse at the fence, `familles-5` on the room in late light, `mariages-3` on the sunburst.
`couples-4`'s three frames of empty buildings are gone.

**Long single-idea sequences.** `mariages-2`'s 45-frame guest block is down to six
photographs that carry the day (the mariachi, the canapés, the group portrait, the parmesan
wheel). `mariages-3`'s 22 lavender frames are eight. `mariages-4`'s nine cape-on-the-wall
frames are four. `couples-2`'s nine pool frames are two.

## Re-aimed after renumbering

The positional-filename hazard documented above bit again, exactly as predicted. Six
hard-coded paths pointed at frames that had moved or been cut:

| Surface | Was | Now |
|---|---|---|
| Homepage · Couples tile | `couples-2-30` | `couples-2-12` |
| Homepage · Mariages tile | `mariages-3-46` (**cut**) | `mariages-3-19` + new alt |
| Homepage · Grossesse tile | `grossesse-1-05` | unchanged |
| `/galeries` · Mariages plate | `mariages-4-66` | `mariages-4-37` |
| `/galeries` · Familles plate | `familles-3-55` | `familles-3-32` |
| `/prestations/grossesse` hero | `grossesse-2-04` | `grossesse-2-03` |

The Mariages tile is the one that needed a real decision rather than a re-aim: its frame
left with the lavender sequence. `mariages-3-19` — the couple walking away across the lawn,
valley below — is horizontal by nature, so the wide cell crops nothing, and it reads as a
wedding in one glance. Its alt text changed with it.

**This release renumbers almost every story frame.** It must not go out without an image
cache purge; see the caveat above.

## Still open

* **`grossesse-1`** (11 frames) — untouched by this pass. It is the remainder of the consent
  cut, not an edit, and the decision is Irina's: re-cut from the originals, or withdraw.
* **`grossesse-3`** (21 frames) — cut hard and improved, but its weaknesses are in the
  shooting, not the edit: flat midday light, cluttered modern backgrounds, a palette cooler
  than the rest of the portfolio. Still the weakest gallery.
* **`couples-3` is a wedding** filed under Couples, and the `/galeries` Mariages plate is
  drawn from a different day. Category boundary still unresolved.
* **`mariages-1`'s description** promises «une journée en noir et blanc»; about half the
  gallery is colour.
* **Alt text** remains positional (`«Titre» — 7 / 22`) everywhere.

---

# Review corrections — 2026-08-02

Five notes from the manual review of the edited portfolio.

**`grossesse-1` — restored to 16 frames (was 11).** The consent cut had been applied too
strictly: frames were removed wherever the lace bra was *visible*, when the rule that matters
is whether it is *see-through*. Six frames went back in, each checked at full size first —
the couple in the green room, his face over hers, the sofa under the LOVE prints, the
hallway mirror, the floor with the black cat, the two chairs by the window. They are the
frames that make it a séance at home rather than a fragment, and in every one the garment
reads as an ordinary bra: small in frame, no transparency legible.

One frame went the other way. The belly detail at position 04 (`096A7278`) still showed the
underwear through the fabric on review, so it is out. That also sets the line for this
séance: **any frame where the lace sits at skin level is out, however abstract the crop** —
the earlier "lace edge only, no breast" reasoning was too fine a distinction to publish on.

Order is chronological again, so the story runs: the apartment → the sofa → the hallway →
the floor → the chairs → the bed → foreheads together → the white-dress close.

**Four covers replaced.**

| Gallery | Was | Now | Why |
|---|---|---|---|
| `mariages-2` | `096A1315` | `096A1356` | The old cover was a **portrait** frame in a 3:2 plate, so the crop cut it hard. The new one is landscape-native — his hand at her cheek, dark suit filling the left — so nothing crops, and the title sits on the dark third. |
| `couples-3` | `096A9213` | `096A8829` | The beach huts were graphic but read as a colour block, not as a couple. The wide beach — turquoise water, headland, the two of them — is what the gallery is called, and it suits the lead plate's format. |
| `couples-2` | `096A7223` | `326A6883` | Also **portrait** in a 3:2 plate. The couple walking up the lawn to the white manor names the gallery in one frame and is landscape-native. |
| `grossesse-3` | `096A4503` | `096A4295` | The overhead-in-grass frame put the title over bright lawn — unreadable. The family on the terrace sofa with the dog has a dark lower-left, and it is the warmest frame in a gallery whose weakness is flat light. |

**Cover rule worth keeping:** the plaque and caption are absolutely positioned *inside* the
plate, bottom-left, in bone with a soft shadow. A cover therefore needs three things — the
right orientation for its plate (landscape for a 3:2 strip plate), a quiet lower-left third,
and it must name the gallery at thumbnail size.

**The renumbering trap, again — and a sharper lesson.** Restoring six frames to
`grossesse-1` shifted everything after them. `grossesse-1-05.jpg` still *existed*, so a
file-exists check passed — but it now held a different photograph, and the homepage
Grossesse tile was silently pointing at the wrong one. Re-aimed to `grossesse-1-10.jpg`.

**Checking that a referenced path exists is not enough. Resolve the intended SOURCE
filename to its current position and compare.**
