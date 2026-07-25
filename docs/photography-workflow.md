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
