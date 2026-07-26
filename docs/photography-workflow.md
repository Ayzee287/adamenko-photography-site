# Photography workflow — curation, not ingestion

A portfolio is an **edit**, not a folder listing. The order of photographs, the opening
frame, the rhythm between wide shots and details, and the closing frame are creative
decisions. This workflow keeps every one of them with a human, and gives the machine only
the jobs it is actually good at: laying the take out for review, optimising files, and
wiring the result into the site without transcription errors.

```
RAW LIBRARY  →  contact sheets  →  HUMAN REVIEW + SELECTION + ORDERING  →  optimise  →  website
             (machine organises)         (curation/collections.txt)        (machine)
```

## The three commands

| Command | What it does |
|---|---|
| `npm run photos:sheets` | Lays the **whole raw library** onto numbered contact sheets in `curation/sheets/` for review. `-- --new` shows only frames not yet in the edit. Makes **no** selection. |
| `npm run photos:check` | Validates `curation/collections.txt` without touching anything. |
| `npm run photos:build` | Optimises exactly the chosen frames, regenerates both locale surfaces, refreshes blur placeholders. |

The raw library defaults to `C:\Users\Administrator\Documents\photos`; override with the
`PHOTO_LIBRARY` environment variable.

## The edit lives in one file

`curation/collections.txt` **is** the galleries. Nothing else decides what appears.

```
[mariages]
title: Mariages
title.en: Weddings
intro: Le récit d'une journée — de Lyon aux côtes de Bretagne…
intro.en: The story of a day — from Lyon to the Brittany coast…
cover: IMG_8402 | Les mariés face à la mer… | The newlyweds facing the sea…
IMG_3259 | Les préparatifs de la mariée…   | The bride getting ready…
IMG_3232 | Les mariés s'embrassent…        | The newlyweds kiss…
```

- **The order of the lines is the order on the wall.** Re-ordering a gallery is moving
  lines; removing a photograph is deleting or `#`-commenting its line.
- **The first photo line is the opening frame; the last is the closing frame.**
- `cover:` is the frame used on the `/galeries` index — it can differ from the opener.
- Alt text after the first `|` is **required** (accessibility + SEO). Describe what is in
  the frame, plainly, in French. Never name a client.
- Text after a second `|` is the English alt. Optional — it falls back to French.

## Curating a gallery

1. `npm run photos:sheets` — review the take. Frames already in the edit are marked `•`.
2. Open `curation/collections.txt` and write the edit: pick the frames, put them in the
   order you want them experienced, describe each one.
3. `npm run photos:check` — catches a typo'd filename, a missing alt, a duplicate.
4. `npm run photos:build` — publishes it.

Think about **sequence**, not just selection: open strong, vary orientation and scale so
the eye keeps moving, let a quiet detail follow a loud wide shot, keep colour temperature
from lurching frame to frame, and close deliberately.

## What the build guarantees

- Frames are auto-rotated, **EXIF-stripped** (privacy), resized to a 2200px web master and
  mozjpeg-encoded at q82.
- Output is `public/galleries/<slug>/<slug>-aNN.jpg` — `a00` is the cover, `a01…` the hang
  order. **Outputs from a previous, longer edit are deleted**, so no orphans accumulate.
- `src/content/galleries.ts` (French model) and `src/content/galleries.en.ts` (English
  overlay) are regenerated from the **same** sheet, so the two locales cannot drift. Both
  files are generated — **never hand-edit them**; edit the curation sheet and rebuild.
- Recorded widths/heights are the true output dimensions, so the gallery hangs every frame
  at its real aspect ratio, uncropped.

## Adding or renaming a collection

Collection slugs are currently `familles · grossesse · couples · portraits · mariages`
(they match the gallery routes and the service slugs). Adding a new one means adding it to
`ORDER` in `scripts/photos-build.mjs`, to `GenreSlug` in `src/types/gallery.ts`, and to the
route registry — the curation sheet alone cannot invent a route.

---

# Stories — one shoot, its own page

A genre wall answers *"what does a wedding by this photographer look like?"*. A **story**
answers *"what happened at this one?"*. Both exist; neither replaces the other.

```
STORY LIBRARY                              WEBSITE
<library>/<category>/<slug>/*.jpg   →      /galeries/<category>/<slug>
             + story.txt (the edit)        (the category page becomes their index)
```

The story layer sits **alongside** `curation/collections.txt`, which still owns the genre
walls. A category with no stories behaves exactly as before.

## The two commands

| Command | What it does |
|---|---|
| `npm run stories:check` | Validates every story folder and writes nothing. |
| `npm run stories:build` | Creates/updates each `story.txt`, optimises what changed, regenerates `src/content/stories.generated.ts`. |

The library defaults to `C:\Users\Administrator\Documents\photos-stories`; override with
`STORY_LIBRARY`. `npm run photos:publish` runs stories, galleries and blur placeholders in
one go.

## Publishing a shoot

1. **Make a folder** — `<library>/mariages/lucie-et-thomas/` — and drop the selected
   photographs in. The folder name is the URL; the parent folder is the category.
2. `npm run stories:build` — writes a `story.txt` listing every frame, and reports what it
   still needs.
3. **Edit `story.txt`**: a title, alt text per frame, and the order you want them walked.
   Set `visibility: portfolio` when it is ready.
4. `npm run stories:build` again — it publishes.

## Visibility — nothing is public by being found

| State | Meaning |
|---|---|
| `private` | Never built, never exported, never deployed. |
| `draft` | Exported to `public/stories-draft/` (**gitignored**) so `next dev` can show it. Not published. |
| `portfolio` | Public. Requires a title and alt text on **every** frame, or the build refuses. |

A newly discovered folder starts at `draft`. Promoting a story moves its files into
`public/stories/`; demoting one **removes** them from there — the route gate hides a page,
not a JPEG, so the two roots are the real boundary.

## Derived vs editorial — never type what the computer can read

**Derived** (read off the photographs on every run, never stored in `story.txt`):
dimensions · aspect ratio · orientation · capture date · content hash · integrity ·
duplicate detection · ordering default · frame count.

**Editorial** (yours; the tool creates these fields empty and never rewrites them):
title · description · alt text · cover · explicit order · visibility · location.

The tool only ever **appends** newly-found frames to `story.txt`. A frame you delete or
`#`-comment stays gone.

## Privacy

- Published exports carry **no EXIF, ICC, XMP or IPTC** — the re-encode drops all of it, so
  no GPS coordinate can reach the site. Asserted in `tests/unit/story-pipeline.test.ts`.
- The pipeline has **no GPS reader at all**; it parses one EXIF tag (capture time).
- `location:` is opt-in free text. Empty unless you type it — a venue can identify a
  private event.
- `date:` is published at **month precision**.
- Client names are never inferred. A story is called whatever you call it.

## Performance

Measured on a 52-frame story (Fast 4G, production build):

| | initial cost | full scroll |
|---|---|---|
| mobile 390 / dpr3 | 12 images · 562 KB · load 1.9 s | 53 images · 3.4 MB |
| desktop 1440 | 28 images · 637 KB · load 2.4 s | 55 images · 1.1 MB |

CLS **0** at every viewport. Entering a category costs its story **covers only** — a
category holding three 50-frame weddings still loads three covers, not 150 photographs.

---

# Client delivery (Pixieset) — deliberately a separate pipeline

**Pixieset has no public API.** Verified 2026-07-26 against `pixieset.com/apps` and the
Pixieset help centre: the entire official integration surface is the **Lightroom Classic
publish plug-in**, the Studio Manager mobile app, and the Photo Editor. Searching their help
centre for "API" returns PayPal's API and an Instagram feed. There is no upload API, no
webhooks and no official Zapier app. Community reverse-engineered endpoints exist and are
explicitly unaffiliated and unstable — client deliverables will not be built on them.

That is not a gap to work around. The client gallery and the public portfolio are **different
products**: one is the complete take, private, downloadable, proofed; the other is a small
curated edit that exists to be seen. Synchronising them would mean constantly separating
things that were never meant to be together.

**So the two pipelines share only the Lightroom catalogue, and nothing else:**

```
Lightroom  ──→  Pixieset Publish Service  ──→  client gallery   (complete take, private)
        └──→  export selects to <STORY_LIBRARY>/<cat>/<slug>/  ──→  stories:build  ──→  website
```

If a shoot is already exported to a folder rather than sitting in Lightroom:

```
npm run delivery:prepare -- --from <folder> --collection "Lucie & Thomas" --set "Ceremonie"
```

It copies (never moves) into `client-delivery/<Collection>/<Set>/` numbered in **capture-time
order**, skips unreadable files, and writes a `MANIFEST.txt` mapping delivery numbers back to
original filenames. The remaining human action is one drag into the Pixieset uploader.
