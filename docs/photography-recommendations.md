# Photography Recommendations — Adamenko Photography

**Date:** 2026-06-24
**Reviewed:** the 453 photographs recovered from the old site (`backend/public/img/`), plus the curated `swiperIndex/` (her homepage picks) and `workStyle/` (her genre-cover picks). The public Instagram (`@adamenko_photography`) is login-walled to automated tools; her own curated set above is the same body of work and a sufficient basis for these picks.

> **These are recommendations, not a publish action.** No photograph has been committed to the (public) repo. Before any of these go live the owner must: (1) confirm **consent** for web use; (2) **strip EXIF/GPS**; (3) **rename** to remove client names (privacy/RGPD); ideally (4) re-export at higher resolution (the recovered files are ≤ 1280 px; the new site wants 1600–2400 px masters). Migration is data-only once dropped in — see `docs/image-guidelines.md`.

---

## How these were judged

Against the brand thesis (documentary · natural light · real emotion · warm, not staged) and each slot's job. Her work is genuinely strong and **unmistakably hers** — that matters: a hero must be impossible to confuse with stock, which only a real frame achieves.

---

## 1. Hero (homepage, 16:9, LCP)

The hero must say *documentary + emotion + range* in one frame, with room low-left for the headline over a scrim.

1. **`swiperIndex/sw1.jpg`** *(recommended)* — bride in a caped gown + groom on a stone terrace over Tuscan hills, arms thrown up in joy. Cinematic, natural light, real elation; instantly signals "available across Europe / destination". Landscape, headroom for type. **Why:** aspirational *and* candid — sells the feeling without a posed cliché.
2. **`workStyle/Family.jpg`** — father lifting a baby in a sunlit Haussmann apartment, mother watching, herringbone floor. **Why:** this is the *core buyer's* dream frame — real family life, in-home, warm. The most on-thesis image in the set. Strong alternate hero if she'd rather lead with **family** than weddings.
3. **`swiperIndex/swipe22.jpg`** — couple embracing in a golden field holding an ultrasound. **Why:** warm, emotional, golden-hour; great if leading with **maternity/announcements**.

> Lead-genre is a positioning choice: **weddings** (sw1, aspirational/higher-ticket) vs **family** (Family.jpg, core market). Recommend Family.jpg if the business priority is local family work; sw1 if growing destination weddings. Either is a real, ownable hero.

---

## 2. About portrait (4:5)

**`photoAboutMe.jpg`** *(strongly recommended)* — B&W, Irina smiling, holding a vintage film rangefinder. **Why:** it's *her*, it's warm and human, the film camera quietly says "photographer", and B&W fits the editorial system. It is also the **single safest real image to publish** (the subject is the photographer herself). Only caveat: 853×1198 — fine, but a higher-res re-scan/re-export would be ideal. This unblocks the About page immediately.

---

## 3. Gallery / category covers (`/galeries` index, 4:5)

Her own `workStyle/` picks are purpose-made covers — reuse her curation:

| Genre | Recommended cover | Why |
|---|---|---|
| **Familles** | `workStyle/Family.jpg` (or hold for hero) | In-home, sunlit, real life. If used as hero, pick a second family frame. |
| **Couples** | `workStyle/LoveS.jpg` | Couple kissing on a Paris curb, beige/brown tailoring — editorial-documentary, ownable. |
| **Grossesse** | `workStyle/beremennost.jpg` / `swiperIndex/swipe22.jpg` | Golden-hour field, ultrasound — tender, natural. |
| **Mariages** | `workStyle/wedd.jpg` | Couple by a burgundy Citroën 2CV at a stone château (plate "69" = Rhône) — quintessentially French/local. |
| **Portraits** | *(none in archive)* | New genre — needs a dedicated portrait frame from her catalogue, or keep the reserved frame until supplied. |

The new `/galeries` index already reserves a 4:5 **cover frame per genre** (`galleries.ts` → `cover`), each carrying an art-direction note matched to these picks — so dropping the real covers in is a one-line data change with no layout shift.

---

## 4. Social sharing / OpenGraph (1200×630)

- **Now:** the auto-generated typographic OG card ships (no action).
- **Upgrade:** a **landscape** signature frame works best cropped to 1.91:1 with centre-safe subject. **`swiperIndex/sw1.jpg`** or **`workStyle/Family.jpg`** are the strongest; overlay the wordmark only with a scrim (`wordmark-on-dark.svg`). See `docs/image-guidelines.md` §8.

---

## 5. Homepage reel ("exhibition wall")

Sequence ~8–10 mixed-orientation frames as an emotional arc (arrival → connection → climax → quiet), mixing colour and B&W. Strong candidates seen: `sw1`, `SWIP2` (B&W shoulder-lift celebration), `swipe22`, `LoveS`, `Family`, `wedd`, plus a maternity profile and a newborn-in-arms. The reel's `featured` array already reserves this rhythm — replace frames in order.

---

## 6. Selection checklist (per image, before publishing)

- [ ] Consent confirmed for web use (esp. weddings/children)
- [ ] EXIF/GPS stripped
- [ ] Renamed — **no client names** in the filename (`docs/image-guidelines.md` §4)
- [ ] Re-exported sRGB, long edge per slot (hero 2400 / gallery 1600–2000 / portrait 1600)
- [ ] Registered with `src` + intrinsic `width`/`height` + real French `alt`
- [ ] `npm run build` clean; no layout shift; hero LCP fast
