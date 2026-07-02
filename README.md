# Adamenko Photography — Portfolio Website

A warm, premium portfolio website for **Adamenko Photography** — an independent
**family, portrait, maternity, couples & wedding** photographer based in **Lyon, France**.

The site's single job: let a visitor *feel the warmth and trust in the work*, then **inquire**.
It is image-first and quiet — the interface frames the photographs and then gets out of the way.
Brand register is **premium without being exclusive** — never luxury-aloof.

> Strategy, decisions, and design rules live in the AI-Studio vault
> (`AI-Studio/01_Clients/Adamenko_Photography/`), not in this repo. This repo is the code.

## Technology stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, static-first) |
| Language | TypeScript (strict) · React 19 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first `@theme`, no config file) |
| Images | `next/image` — AVIF/WebP, responsive `srcset`, blur placeholders |
| Fonts | Fraunces (display) · Inter (body) via `next/font` |
| Analytics | `@vercel/analytics` |
| Hosting | [Vercel](https://vercel.com) (subdomain at launch; custom domain deferred) |

## Project structure

```
src/
  proxy.ts             Locale routing: FR unprefixed at "/", EN at /en (rewrite + 308)
  app/
    [lang]/            The bilingual route tree (FR + EN prerendered per locale)
      page.tsx         Accueil (home)
      galeries/        Work landing + /galeries/[genre] galleries
      a-propos/        About
      prestations/     Services (inquiry-only funnel) + FAQ
      contact/         Inquiry form
      mentions-legales/ · confidentialite/   Legal pages (LCEN + RGPD)
      [...notfound]/   Localised, branded 404 catch-all
      opengraph-image · twitter-image        Per-locale social cards
    api/contact/       Inquiry delivery endpoint (rate limit → validate → Resend)
    sitemap.ts · robots.ts
  components/
    layout/            Container, SiteHeader, MobileMenu, SiteFooter, PageHeader,
                       LanguageSwitcher, SocialLinks
    home/              The homepage section components (the approved benchmark)
    gallery/           GalleryView (masonry), HorizontalGallery (reel), Lightbox
    motion/            Reveal, Parallax, reduced-motion hook
    ui/                ImageFigure, ButtonLink
    legal/ · seo/      Legal document renderer · JSON-LD injector
  content/             Typed content schema: identity, galleries, services, FAQ,
                       legal, locations (no CMS)
    dictionaries/      fr (canonical) · en (live) · ru/uk (drafts, inactive)
  lib/                 i18n + request locale, SEO helpers, structured data, og,
                       contact validation, email pipeline, rate limit, blur map
  styles/              globals.css (tokens + interaction clock), motion.css
  types/               Gallery types
scripts/
  gen-blur.mjs         Regenerates the blur-up map after adding photos (npm run gen:blur)
public/
  galleries/<genre>/   Web-export gallery photographs (committed)
  home/ · about/       Hero + portrait
  brand/               Off-site brand marks (wordmark, monogram, watermark)
```

Content is **typed data, not a CMS** — adding a photo is one data entry + one export.
See the vault `image-strategy` and `frontend-architecture` notes.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (eslint-config-next)
npm run typecheck  # tsc --noEmit
npm run gen:blur   # regenerate blur-up placeholders after adding/replacing photos
```

> Requires Node 20+ (developed on Node 24).

## Deployment

Hosted on **Vercel** with Git integration:

- Every push to a branch creates a **preview deployment**.
- Merges to `main` deploy to **production** automatically.
- Launch target is a Vercel **subdomain**; a custom domain will be added later.
- `robots.ts` disallows indexing of non-production deployments so previews never
  compete in search.

**Going live?** Follow [`docs/launch-checklist.md`](./docs/launch-checklist.md) — the single
production-launch checklist (engineering ✅ verified; remaining items are the Vercel import,
environment variables, and Resend setup). The contact-email pipeline (architecture, required
DNS records, env vars, the ≈5-minute Resend connect, and troubleshooting) is documented in
[`docs/email-architecture.md`](./docs/email-architecture.md).

## Status

The site is **code-complete**. Remaining work is owner content + deployment ops, not engineering:

- [x] Strategy, brand direction, information architecture (in vault)
- [x] Design system, layout shell, gallery components, all routes
- [x] Real galleries + hero + portrait (curated, optimised, registered)
- [x] Content: home, about (bio + portrait), services, FAQ, contact, legal pages
- [x] Inquiry form wired to delivery (Resend REST + honeypot + server validation)
- [x] SEO: LocalBusiness/Person JSON-LD, photo-backed OpenGraph, sitemap, robots, hreflang scaffold
- [ ] Owner: confirm bio/pricing, real testimonials, legal facts — see `docs/owner-todo.md`
- [ ] Ops: Resend account + verified domain, Vercel import + env vars, launch on subdomain

## License

Source code: [MIT](./LICENSE). **Photographs are © Adamenko Photography — all rights
reserved, not covered by the MIT license.**
