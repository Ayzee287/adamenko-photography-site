# Original Site Recovery — `antonmokryi/photographiAdamenko`

**Date:** 2026-06-24
**Source:** https://github.com/antonmokryi/photographiAdamenko (public, single commit `6d6d68d` "checkr")
**Purpose:** recover every useful fact and asset from the photographer's *previous* website to improve the new one. **Not** to restore the old site — it is a low-fidelity Express/EJS prototype. The value is the **content, the real photographs, and the business facts** it contains.

> Privacy note up front: the archive contains **453 real client photographs** (~48 MB) under folders that include **client names**. None of these have been copied into this (public) repository. They are catalogued and recommended here; publishing any of them is an owner decision gated on consent + a metadata strip + a privacy-safe rename (see `docs/image-guidelines.md` §4 and `docs/photography-recommendations.md`).

---

## 1. What the old site was (stack & structure)

A small **Node.js / Express + EJS** server-rendered site (not the new Next.js app):

```
backend/
  index.js            Express server (3 routes: / , /portfolio , /admin) + a Mongo + multer upload stub
  data.js             ALL content as one JS object (copy, pricing, contacts, bio, gallery manifest)
  views/              index.ejs · portfolio.ejs · admin.ejs
  public/css/         style/index/portfolio/responsive (.scss + compiled .css)
  public/js/          indexJs.js · portfolio.js (Swiper-based)
  public/img/         453 photos — Album/<Genre>/<Client>/… + swiperIndex/ + workStyle/ + photoAboutMe.jpg
```

- Front-end libs: **Swiper 10** (galleries/slider) + **Bootstrap 5**. No build system, no SEO tooling, no metadata beyond `<title>`, `lang="en"` (incorrect — content is French).
- A hardcoded **MongoDB connection string with credentials** is committed in `index.js` (`mongodb+srv://user:user@…`). It's a throwaway demo cluster, but **flag for the owner**: rotate/delete it; never reuse that pattern.
- Site was **built by a third party** — footer reads `© 2023 Anton Mokriy` (the `antonmokryi` GitHub owner). Relevant for the new **Mentions légales "Crédits"** line (the new site is a separate work; credit the new developer or leave the prior credit off).

**Verdict:** nothing in the *code* is worth porting. Everything worth keeping is **content + assets**, recovered below.

---

## 2. Recovered business facts (corroborate / enrich the confirmed set)

| Fact | Old site value | Status in new site |
|---|---|---|
| Display name | "IRINA ADAMENKO — photography" / "photographe" | ✅ `photographer.name = "Irina Adamenko"` |
| First name (bio) | **"Je m'appelle Iryna"** | Confirms the personal name |
| Email | **Adamenkosi@meta.ua** (old, Ukrainian) | ⚠️ Superseded by the confirmed **adamenkoiu@gmail.com** — the old one is dead, don't use |
| Facebook | facebook.com/profile.php?id=**100011367545612** | ✅ added to identity model + `sameAs` |
| Instagram | instagram.com/adamenko_photography | ✅ already in model |
| **Telegram** | **t.me/AdamenkoIr** | ✅ **recovered & added** (was missing) — confirm it's still active |
| Nav labels (FR) | Portefeuille · Tarifs · Contact | Informs tone; new nav is Galeries · À propos · Prestations · Contact |

---

## 3. Recovered biography (her own words, French)

The single most valuable text recovery. Verbatim from `data.js` (`textAboutMe`):

> « Je m'appelle **Iryna** et je suis photographe de famille. Je suis **avocat de formation**, mais je me suis lancée dans la photographie **il y a 8 ans** et depuis je ne peux pas imaginer ma vie sans appareil photo.
> Je suis **ukrainienne**, mais je vis avec ma famille **à Lyon** depuis près de deux ans. Je suis **maman de trois enfants** de 16, 10 et 3 ans, je m'entends donc bien avec les enfants de tous âges !
> J'aime **photographier la vie telle qu'elle est**. Avec moi, vous n'aurez pas à regarder timidement l'appareil photo, je vous guiderai en vous proposant des poses faciles… Des sourires sincères, des câlins, des jeux avec les enfants, les rituels quotidiens… »

**Durable facts extracted** (used to enrich the DRAFT bio in `content/photographer.ts`): Ukrainian; based in Lyon with her family; **trained as a lawyer**, then photography; **mother of three**; documentary, minimal-posing approach ("photograph life as it is", gentle guidance).

**Dropped as stale** (would be fabrication if guessed forward): "**il y a 8 ans**" (→ ~11 yrs now), "**depuis près de deux ans**" (→ longer now), child ages "16, 10, 3" (→ older now). The bio was rewritten to avoid all dating figures. **OWNER TODO:** confirm the bio and, if wanted, restore a *current* timeframe / ages.

> The old bio ends on "garder le souvenir / conserver vos plus beaux souvenirs" — the exact **"capturing memories" cliché the brand voice now bans**. The new draft deliberately avoids it.

---

## 4. Recovered pricing (2023 — reference only, NOT published)

Real historical figures + package structure from `data.js` (`workStyle`). **Not** put on the live site (D007/D012 keep pricing inquiry-only, and 2023 figures are very likely stale). Recorded so the owner has a concrete baseline to confirm/update:

| Package | 2023 price | Inclusions (summary) |
|---|---|---|
| **Famille** | 250 € | 1 h · studio*/nature/home · 80+ retouched HD · private gallery 7 days · 30% deposit · ready in 2 weeks |
| **Couple** | 250 € | same as Famille |
| **Grossesse** | 250 € | same as Famille |
| **Mariage — MINIMUM** | 650 € | 2–3 h · 150–200 photos · B&W set · up to 1 month |
| **Mariage — STANDARD** | 1000 € | ~6–8 h · 400–600 photos · up to 2 months |
| **Mariage — MAXIMUM** | 1300 € | ~9–10 h (to 23h) · 600–800 photos · up to 2 months |

\* studio rental billed separately (~60 €/h in 2023); travel outside the city billed extra.

**OWNER TODO:** confirm current rates. If she wants public "à partir de" pricing, the structure (`content/pricing.ts`, `priceFrom`) is ready — see `docs/owner-todo.md` A9.

---

## 5. Recovered asset inventory (453 images, ~48 MB, max 1280 px)

All web-sized (longest edge ≤ 1280 px) — fine for the web, **below the 1600–2400 px masters** the new site's image guidelines ask for. Prefer **fresh high-res exports** for hero/covers; these are an excellent *evaluation + fallback* set.

**Galleries by genre** (old → new mapping):

| Old folder | New genre | Albums (client sets) |
|---|---|---|
| `Album/Family` | `familles` | Julia Ilya & Mira · Nina Egor & Tim · Simona Fabricio & Mishelle · + 3 unnamed |
| `Album/Grossess` | `grossesse` | Anne & William · Katya & Bogdan · Simona & Fabrico · + 1 unnamed |
| `Album/LoveStory` | `couples` | Kristina & Andre |
| `Album/Wedding` | `mariages` | Katya & Aksel · Kristina & Andre · Lina & James · + 1 unnamed |
| — | `portraits` | (none in the old site — a NEW genre on the new site) |

**Curated marketing images (lowest-risk, she chose these as public covers):**
- `photoAboutMe.jpg` (853×1198) — **the photographer's own portrait**, B&W, holding a film camera. On-brand and the single safest real image (it's her). → recommended About portrait.
- `swiperIndex/` (5–8 files, ~1280×853) — her **homepage hero** picks (destination weddings, golden-hour maternity).
- `workStyle/` (7 files, ~853×1280 portrait) — her **per-genre cover** picks (Family, LoveS, beremennost, wed3/wedd/Wedding, portfolio).

Full picks + rationale: **`docs/photography-recommendations.md`**.

---

## 6. Recovered branding / typography (old identity — informs, not inherited)

- **Logo lockup:** "IRINA ADAMENKO" (display serif) over "photography/photographe" (small caption) — a classic two-line photographer lockup. The new wordmark (`public/brand/wordmark.svg`) keeps that DNA but uses the brand name *Adamenko Photography* and the warm Fraunces system.
- **Old type:** Bodoni Moda / Playfair Display / Oswald + Inter/Roboto — high-contrast didone display. The new system swaps to **Fraunces** (warmer, friendlier) per D006 (warm, not cold-editorial). A deliberate, documented divergence.
- **Old palette:** black/white + photos. The new warm-cream palette is a clear upgrade for skin tones and warmth.

See **`docs/brand-identity.md`** for the full new identity.

---

## 7. What was recovered → where it landed

| Recovered | Action |
|---|---|
| Personal name, email, Facebook, **Telegram** | ✅ ingested into `content/photographer.ts` + legal + `sameAs` |
| Durable bio facts | ✅ enriched DRAFT bio (dating figures dropped) |
| 2023 pricing + package structure | 📄 documented (here + owner-todo) — not published |
| Genre taxonomy (family/maternity/couple/wedding) | ✅ confirms the new 5-genre split |
| Portrait + hero + cover photographs | 📄 recommended (photography-recommendations.md) — **not committed** (consent/privacy) |
| Old branding/typography | 📄 informed the new brand-identity.md (divergence documented) |
| MongoDB creds in old repo | ⚠️ flagged to owner — rotate/ignore |
