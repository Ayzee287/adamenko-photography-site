# Brand Foundation — Adamenko Photography

**Date:** 2026-06-20
**Status:** Draft for the owner to confirm. This is the reference every piece of copy, every page, and every future translation should be measured against.

> All copy is **DRAFT in the brand voice** — confirm each line with the photographer. Never invent biographical facts (years, awards, stories). When in doubt, say less.

---

## 1. Mission statement

> I make honest, documentary photographs of the people and days that matter — family life, love, and the moments in between — so they're remembered as they truly felt, not as they were posed.

A shorter internal version: **photograph real life, warmly and truthfully — for the people in it, not for an audience.**

---

## 2. Positioning statement

The one sentence that says who this is for, what it is, and where.

**Recommended (primary):**
> **Documentary family, couple and wedding photography — natural light, real moments — based in Lyon, available across Europe.**

### 3–5 options to choose from
1. *(recommended)* **Documentary family, couple and wedding photography — natural light, real moments — based in Lyon, available across Europe.**
2. Lyon-based photographer for families, couples and weddings — a quiet, documentary eye, working in natural light across Europe.
3. Honest photographs of family life, love, and the days that matter — from Lyon, throughout Europe.
4. Natural-light, documentary photography for families and weddings — based in Lyon, available wherever the story is.
5. A documentary approach to family, couple and wedding photography — real interactions over perfect poses. Lyon, and beyond.

> The brief's two examples ("Based in Lyon, available across Europe." / "Documentary family and wedding photography in Lyon and beyond.") are good seeds; the options above fold in the **documentary + natural-light + real-moments** identity, which is the real differentiator. Pick one, then keep it consistent across the homepage hero, meta description, Instagram bio, and the JSON-LD `description`.

**French (canonical) form of the recommended line** *(matches the live `site.tagline`)*:
> Photographe de famille, de couple et de mariage à Lyon — une approche documentaire, en lumière naturelle. Disponible partout en Europe.

---

## 3. Brand values

| Value | What it means in practice |
|---|---|
| **Authenticity** | Real interactions over staged perfection. If it didn't happen, we don't fake it. |
| **Warmth** | Premium, never aloof. The register is intimate and human, not luxury-cold. |
| **Presence** | Calm, attentive, in the background. The photographer disappears so life can happen. |
| **Honesty** | No fabricated facts, no invented testimonials, transparent about pricing and travel. |
| **Craft** | Natural light, a considered edit, colour and black-and-white used with intent. |

---

## 4. Tone of voice

- **Person:** first person ("je"), speaking directly to the client ("vous").
- **Register:** warm, plain, editorial. Calm and confident, never salesy or breathless.
- **Sentences:** short. Concrete nouns. Few adjectives. White space is part of the voice.
- **Emotion:** named simply, not oversold ("l'attente", "le lien") — let the restraint carry the feeling.

**Say:** real moments · natural light · the way you are together · the days that matter · documentary · in between.
**Never say:** *capturing memories · freezing moments · timeless images · passionate about · "let me tell your story" · epic · stunning · magical.*

---

## 5. Content principles

1. **Show, don't claim.** The photographs prove the eye; copy stays quiet and gets out of the way.
2. **Specific beats generic.** "Le brouhaha du dimanche matin" not "precious family moments".
3. **Never fabricate.** Names, years, awards, prices, testimonials — real or omitted. Placeholders are marked, not faked.
4. **One idea per block.** Each section earns its place; cut anything that merely fills space.
5. **Reassure, don't pressure.** The goal is an inquiry, not a hard sell — calm CTAs, one primary action per view.
6. **Bilingual-ready.** Write French first as the canonical source; keep sentences translatable (avoid untranslatable idioms where a plainer line works).

---

## 6. Visual principles

*(These describe the approved system — they are the benchmark, not a redesign brief.)*

- **Image-first.** The interface frames the photographs, then disappears. Borderless images, no decorative chrome.
- **Warm, near-neutral palette.** Cream paper, warm charcoal ink, a single clay accent used sparingly (links, marks — never buttons or gradients). The photographs carry all the saturation.
- **Editorial typography.** A warm humanist serif (Fraunces) for display, clean sans (Inter) for body; quiet eyebrows, generous measure.
- **Calm motion.** Decelerating, intentional, never springy or decorative. Motion comes to rest.
- **Colour + black-and-white.** Both are part of the look; sequencing mixes them with intent.
- **Placeholder-first integrity.** Reserved frames read as directed art-boards, never "coming soon" gaps; a real photo drops in with zero layout shift.

---

## 7. Photography philosophy

A documentary approach, in plain terms:

- **Real interactions over perfection.** The best frame is usually the unplanned one.
- **Minimal posing.** Light direction, not choreography. People are guided into being themselves.
- **Natural light.** Available light, time-of-day chosen for it; the look is honest, not manufactured.
- **Emotional storytelling, not staging.** The edit follows the arc of a day or a relationship.
- **For the people in it.** Images made to live with — printed, passed on — not made to perform online.

---

## 8. How this maps to the code

The brand foundation is enforceable because content is centralised and typed:

| Brand element | Lives in |
|---|---|
| Positioning / tagline | `content/site.ts` (`tagline`) → meta + JSON-LD |
| Identity (name, bio, availability, specialties) | `content/photographer.ts` |
| Service voice (documentary descriptions) | `content/services.ts` |
| Coverage (Lyon → Europe → international) | `content/locations.ts` |
| Reassurance (FAQ) | `content/faq.ts` |
| Real-only social proof | `content/testimonials.ts` |
| Homepage narrative | `content/home.ts` *(approved — do not redesign)* |
| Future languages | `content/dictionaries/{fr,en,ru,uk}.ts` |

Change the brand, change the data — never the components.
