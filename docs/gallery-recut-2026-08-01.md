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

> **DONE — 2026-08-02.** Shipped, in its own commit, after the predicted failure actually
> happened: the withdrawn maternity frame (old `grossesse-1-15.jpg`, the belly detail with
> the two watches) was still being shown by the deployed preview, at its recycled URL, from
> the image-optimisation cache. The repository was correct throughout — the frame was gone
> from `story.txt`, from the model, from disk and from the local build; only the cache was
> still publishing it.
>
> Exports are now `<slug>-NN.<hash8>.jpg`. The old URL 404s and its optimiser URL 400s, so
> no cache anywhere can serve a withdrawn photograph. Verified: `/stories/.../grossesse-1-15.jpg`
> → 404, `/_next/image?url=…grossesse-1-15.jpg` → 400, the wall renders 21 hashed frames, and
> a perceptual scan (dHash) of all 537 JPEGs under `public/` finds no match for either
> withdrawn frame under any filename.
>
> The cost named above — a hard-coded frame reference now breaking loudly — is covered by
> `npm run validate:content`, which stopped being a stub in the same change and now fails CI
> on a reference that no story publishes.

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

---

# `grossesse-1` — new source frames + frame 06 review, 2026-08-03

Eight photographs were added to `Documents\1\Grosesse\1`. All eight were copied into the
story library so the record is complete; each one that did not make the edit is
`#`-commented with the reason.

**Two earned a place.**

* `096A7032` — the hallway mirror reflecting the couple, his shoulder out of focus in the
  foreground. A genuinely different picture from anything else in the séance, formally the
  most interesting frame in it, and nothing is exposed. It **replaces `096A7055`**, which
  was the same hallway shot plainly and had the lace legible.
* `096A7454` — standing in the doorway light, hand on the belly, the orange lamp anchoring
  the foreground. The same set-up as `096A7446` but far better executed, so it takes that
  slot and **closes the gallery**.

**Six were set aside.** `096A6902` and `096A7063` show the lace legibly on the chest, so
they fail the standard this séance now runs on. `096A7420`, `096A7435` and `096A7435-2` are
chair-by-the-window variants of a frame already held by `096A7426` (and `-2` is the mono
twin of `096A7435`). `096A7458` is near-identical to `096A7454`.

**Frame 06 (`096A7178-2`) removed — agreed.** At a tight crop the floral lace reads clearly
and the breast is discernible through it; the frame is backlit against a bright window,
which makes the fabric *more* transparent, not less. Restoring it on 08-02 was my error.

**Two closing duplicates also went:** `096A7446` (superseded by `096A7454`) and `096A7466`
(a second version of the same doorway, and the series now closes better one frame earlier).

**14 → 12 frames.** The white-dress block drops from six near-identical frames to four, and
the first half gains a beat it did not have. Order stays chronological, so no reordering was
needed:

> the green room · his face over hers · the b/w recline *(cover)* · the window · **the
> mirror** · the bed · foreheads together · the chair with the cat ×2 · standing in profile ·
> the chair by the window · **standing in the light**

**Consequences.** The homepage Grossesse tile followed its source frame (`096A7306-2`) from
`grossesse-1-08` to `grossesse-1-07` — updated in `home.ts`, `en.ts` and `gen-blur.mjs`. The
cover (`096A6951-2`) survived and is now frame 03. Blur map regenerated. Numbering
contiguous 01–12; exports match the edit exactly; every hard-coded reference re-resolved by
**source filename**, not by path existence.

---

# `grossesse-1` — full re-review, 2026-08-04

All 47 source frames re-examined from scratch against one rule: *no clearly readable
transparent lace, no visible breast.* **12 → 23 frames.**

## The finding that changed the edit

The garment is a cream floral-lace bra with **lined cups**. At high magnification it reads
**opaque in ambient light** and **sheer only when back-lit against a bright window**. Every
previous pass had treated "the bra is visible" as the trigger, which is why the gallery kept
shrinking. It is not the garment that fails — it is the light in particular frames.

So the rule is now applied frame by frame, from high-resolution crops of the chest, not from
contact sheets. Twelve frames genuinely fail: `096A6993`, `096A6993-2`, `096A7135-2`,
`096A7152`, `096A7157`, `096A7199`, `096A7219`, `096A7223-2`, `096A7235-2`, `096A7245`,
`096A7253`, `096A7256`, `096A7262`, `096A7344` — all of them either back-lit at the window or
cropped tight enough to read through the lace.

## The eleven frames restored, and what each is for

| Frame | Position | Why it earns its place |
|---|---|---|
| `096A6892` | 02 | The wide opener shows the room; this brings you close enough to *meet* them. Without it the gallery jumps from an establishing shot straight to intimacy. |
| `096A6902` | 03 | The first moment of rest — they settle onto the sofa. Introduces the warmth (orange lamp, green wall) the first movement runs on. |
| `096A6911` | 04 | She laughs, head back on his chest. The only outright joyful frame in the séance; without it the whole story is tender and never light. |
| `096A7035` | 09 | The only frame where she looks straight down the lens. Every séance needs one moment where the subject acknowledges you. |
| `096A7055` | 10 | The wide of the hallway that gives the mirror frame its context — the pair, then the reflection. A transition, not a repeat. |
| `096A7063` | 11 | The two of them face to face with his hand on the bump, full length, a different room. The "just us three" beat. |
| `096A7201-2` | 12 | Bridges the apartment into the bright room where the last act happens. The safe frame of a pose whose colour version fails the rule. |
| `096A7265` | 14 | Knitted booties on the belly — the **only** object detail that survives. A maternity story with nothing of the baby-to-come in it is missing its subject. |
| `096A7295` | 15 | His hands and watch on the belly. The second detail, and the one that puts *him* in the frame with the child. |
| `096A7383` | 17 | He kisses the bump. The emotional peak of the middle movement. |
| `096A7446` | 22 | She looks *down* at the bump; frame 23 looks *up* into the light. Two beats of one gesture, so the ending resolves instead of stopping. |

## The arc, in four movements

> **01–06 · the green room** — standing wide, closer, settling on the sofa, her laughter, his
> face over hers, then alone (b/w, the cover).
> **07–12 · through the apartment** — the window, the mirror, her eyes to camera, the
> hallway, the kitchen, the bright room.
> **13–17 · the bed, and the baby** — b/w on the bed, the booties, his hands, foreheads
> together, the kiss on the bump.
> **18–23 · alone, the white dress** — the chair with the cat, standing profile, the chair by
> the window, looking down, then up into the light.

Chronology preserved throughout; no reordering was needed.

## Not restored — and this is worth revisiting

`096A6991` (the sofa under the LOVE prints) and `096A7087` (on the floor with the black cat)
**both pass the transparency rule** — verified at high resolution, the cups are opaque. They
are out only because Irina rejected them personally on 03/08, under the stricter framing I
was applying at the time. Both are good photographs and both would strengthen the first half.
Worth putting back in front of her.

`096A7178-2` and `096A7278` stay out on their own merits as well as hers.

## Consequences

Homepage Grossesse tile followed its source frame (`096A7306-2`) from `grossesse-1-07` to
`grossesse-1-16`. Cover (`096A6951-2`) is now frame 06. Blur map regenerated. Numbering
contiguous 01–23; exports match the edit; all 47 source files accounted for in `story.txt`,
each rejection carrying its reason.

---

# `grossesse-1` — final adjustments, 2026-08-04 (evening)

**23 → 21 frames.** `096A7265` (knitted booties on the belly) and `096A7295` (his hands and
watch on the belly) removed on review.

**A pattern worth recording:** every tight close-up of the belly has now been refused —
`096A7278`, `096A7262`, `096A7265`, `096A7295`. That is a consistent editorial preference,
not four separate calls. **Do not propose belly close-ups for this séance again.** The
consequence is deliberate: the gallery has no object/detail beat, and it does not need one.

**`096A6991` and `096A7087` are settled — out for good.** Both pass the transparency rule
(verified at high resolution, the cups are opaque), and both are refused. Their lines in
`story.txt` now say *«décision confirmée le 04/08. Ne pas reproposer.»* so this does not come
back around.

The arc still holds without the two details: the green room (01–06) · through the apartment
(07–12) · the bed and the couple (13–15) · alone in the white dress (16–21).

Homepage Grossesse tile followed its source frame from `grossesse-1-16` to `grossesse-1-14`.
Cover unchanged at frame 06.
