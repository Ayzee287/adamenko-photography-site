# Localization Roadmap

**Date:** 2026-06-20 · **Updated:** 2026-06-28
**Status:** **English ACTIVATED 2026-06-28** — French (canonical, `/`) + English (`/en`) both live in production. Russian/Ukrainian remain prepared drafts (not activated).
**Locale plan:** French (canonical, live) → **English (live)** → Russian → Ukrainian.

> **Update 2026-06-28 — English is live.** The activation below (Steps 0–6) was executed:
> the content literals were widened (`Widen<typeof fr>` in `dictionaries/fr.ts`), the full
> English dictionary was written (`dictionaries/en.ts` — a complete human translation, not the
> stale draft, which has been removed), the **`app/[lang]` route tree + `middleware.ts`** were
> added (French served unprefixed at `/` via an internal rewrite; English at `/en`; `/fr/*`
> redirects to `/*`), every server component reads the **request locale** (`lib/request-locale`)
> and every client island receives resolved strings as props, and **`activeLocales = ["fr","en"]`**.
> Verified: `<html lang>`, per-locale title/description/canonical/hreflang(fr/en/x-default)/OG/
> Twitter/JSON-LD, the sitemap (both locales + hreflang), the language switcher, and locale-prefixed
> internal links all localise. **To add Russian/Ukrainian next: translate `dictionaries/{ru,uk}.ts`
> and add the locale to `activeLocales` — no further structural change is required.**

The system is built so that **adding a language is a content + config change, not an architecture change.** No runtime/automatic translation is used anywhere — human translations only.

> **Update 2026-06-24 — translation DRAFTS prepared.** Idiomatic (not literal) human
> drafts now exist as `content/dictionaries/{en,ru,uk}.draft.ts`: **English** covers the
> full UI chrome + page intros + contact form; **Russian/Ukrainian** cover the core chrome
> + intros (Ukrainian is a natural fit — the photographer is Ukrainian). They are imported
> by **nothing** (zero runtime impact) and are the ready-to-paste source for activation.
>
> **Why drafts and not `en.ts` directly:** the French content modules are `as const`, so
> every string is a *literal* type — a `DeepPartial` override in `en.ts` is type-locked to
> the exact French string and can't carry a translation. **Activation step 0** is therefore
> to widen those literals (see §3 Step 0). This was deliberately not done now to avoid
> touching the approved content modules before the French copy is final.

---

## 1. What is already implemented

| Piece | File | State |
|---|---|---|
| Locale model (4 locales) | `lib/i18n.ts` | `locales = [fr, en, ru, uk]`, `defaultLocale = fr`, `activeLocales = [fr]` |
| Locale metadata maps | `lib/i18n.ts` | `localeNames`, `localeShort`, `ogLocale`, `htmlLang` |
| Routing helpers | `lib/i18n.ts` | `localizedPath`, `localeFromPathname`, `stripLocale`, `isLocale` |
| hreflang + canonical | `lib/i18n.ts` (`localizedAlternates`) → `lib/seo.ts` | Emits `<link rel="alternate" hreflang>` for **every active locale** + `x-default` (verified: today FR + x-default only) |
| Translation dictionaries | `content/dictionaries/{fr,en,ru,uk}.ts` | FR fully composed; en/ru/uk are typed empty overrides |
| Dictionary resolver + **fallback** | `lib/dictionary.ts` (`getDictionary`) | Deep-merges a locale over French; missing keys fall back to FR |
| Localized JSON-LD | `lib/structured-data.ts` | `localBusinessJsonLd(locale)` pulls description via `getDictionary` |
| Language switcher | `components/layout/language-switcher.tsx` | Built + mounted in header (desktop + mobile); **renders nothing while one locale is active** → zero visual change today |

**Design choices**
- **Default locale unprefixed.** French stays at `/`, `/galeries`, … Other locales are prefixed: `/en/galeries`, `/ru/…`, `/uk/…` (the contract in `localizedPath`).
- **`activeLocales` gates everything.** hreflang and the switcher only advertise locales that actually have content + routes — never a language that would 404 (which would be an SEO liability).
- **Fallback strategy:** any untranslated key resolves to French. So a partial translation is safe to ship — the page is never broken, just partly French until completed.
- **No DeepL / no runtime MT.** Dictionaries hold human translations the owner provides.

---

## 2. What is intentionally NOT done yet

- No `app/[lang]` route tree (French renders from the existing root routes).
- No translated strings (en/ru/uk dictionaries are empty).
- The switcher is invisible (only FR active).

These are the **activation** steps below. They were deferred because (a) translating draft copy that will still change means translating twice, and (b) an English tree over placeholder content offers little SEO value before launch.

---

## 3. Activation — how to turn on a language (e.g. English)

Do these in order. Step 0 is a one-time type change; steps 1–2 are content; 3–5 are a one-time routing setup shared by all future locales.

### Step 0 — Widen the content literals (one time, enables real overrides)
Because `content/site.ts` etc. are `as const`, the `Dictionary` type pins every string to its French literal. Before any override can compile, relax those modules from `as const` to a `satisfies <Type>` form (or define explicit interfaces whose fields are `string`/`string[]`). Re-run `typecheck` — the French app is unchanged at runtime; only the *types* widen so an English string becomes assignable. The finished translations are already waiting in `*.draft.ts`.

### Step 1 — Translate the dictionary
Paste from `content/dictionaries/en.draft.ts` into `content/dictionaries/en.ts`, mirroring the French structure from `fr.ts`. Translate only what you want; the rest falls back to French.

```ts
// content/dictionaries/en.ts
import type { DeepPartial } from "@/lib/dictionary";
import type { Dictionary } from "./fr";

export const en: DeepPartial<Dictionary> = {
  copy: {
    contact: { title: "Contact", intro: "Tell me about your project…" },
  },
  // …services, faq, home, etc.
};
```

### Step 2 — Translate the routable strings
The genre slugs and route paths stay French by default (simplest, fewest redirects). If localized slugs are wanted later, add a slug map — not required for launch.

### Step 3 — Add the `app/[lang]` route tree (one time)
Restructure rendering so pages read `params.lang` and call `getDictionary(lang)`. Two common shapes:
- **A — `app/[[...lang]]`** optional catch-all keeping French at root. More complex matching.
- **B — `app/[lang]` for non-default + keep root for French** via a middleware rewrite. Cleaner mental model. *(Recommended.)*

Each page becomes locale-driven, e.g.:
```tsx
export function generateStaticParams() {
  return activeLocales.filter((l) => l !== defaultLocale).map((lang) => ({ lang }));
}
export default async function Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  // render from t.* instead of importing content/* directly
}
```
> The homepage components currently import `content/*` directly (zero-regression for French). When `[lang]` is added, pass the resolved dictionary down (or read `getDictionary(lang)` per page). This is the **only** code-shaped task and it must preserve the approved homepage exactly.

### Step 4 — Add middleware for locale routing (one time)
Detect/normalize locale and rewrite the default locale to the root tree. Ready-to-enable sketch:

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { activeLocales, defaultLocale, isLocale } from "@/lib/i18n";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];
  // Unknown/inactive locale prefix → 404 via normal routing.
  if (isLocale(seg) && !activeLocales.includes(seg)) return NextResponse.next();
  // (Optional) redirect /<defaultLocale>/* → /* to keep French canonical at root.
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
```

### Step 5 — Flip the switch
Add the locale to `activeLocales` in `lib/i18n.ts`:
```ts
export const activeLocales: readonly Locale[] = ["fr", "en"];
```
This automatically: shows the switcher, emits `hreflang="en"`, and includes `/en` in alternates. Then add the localized routes to `app/sitemap.ts`.

### Step 6 — Verify
`build` + `typecheck` + `lint`; confirm `/en` renders, hreflang lists fr/en/x-default, the switcher appears and preserves the path, and JSON-LD/OG localize.

---

## 4. Per-locale notes

| Locale | OG locale | Notes |
|---|---|---|
| `fr` | `fr_FR` | Canonical. Already live. |
| `en` | `en_US` | First to activate — international clients. |
| `ru` | `ru_RU` | Phase 3. |
| `uk` | `uk_UA` | Phase 3. |

---

## 5. Recommendation

**Ship the French site first.** Activate **English after launch**, once French content (photos, bio, copy) is final — translating finished copy once. Russian and Ukrainian follow when there's demand. The architecture imposes no penalty for waiting: it's already in place and tested.
