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
  app/                 App Router routes (French-primary)
    page.tsx           Accueil (home)
    galeries/          Work landing + /galeries/[genre] galleries
    a-propos/          About
    prestations/       Services (inquiry-only, no public prices)
    contact/           Inquiry form
  components/
    layout/            Container, SiteHeader, SiteFooter
    gallery/           GalleryView (responsive grid + lightbox)
    ui/                ImageFigure, Hero
  content/             Typed content: site identity, nav, galleries (the content schema)
  lib/                 site config, SEO helpers, utils
  styles/              globals.css (tokens + interaction clock), motion.css
  types/               Gallery types
public/
  galleries/<genre>/   Web-export images live here (NOT committed until ready)
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
```

> Requires Node 20+ (developed on Node 24).

## Deployment

Hosted on **Vercel** with Git integration:

- Every push to a branch creates a **preview deployment**.
- Merges to `main` deploy to **production** automatically.
- Launch target is a Vercel **subdomain**; a custom domain will be added later.
- `robots.ts` disallows indexing of non-production deployments so previews never
  compete in search.

## Roadmap

- [x] Strategy, brand direction, and information architecture (in vault)
- [x] Next.js scaffold: design system, layout shell, gallery components, routes
- [ ] Real galleries: cull → grade → export → register (per genre)
- [ ] Content: home headline · about bio + portrait · services · contact copy
- [ ] Wire the inquiry form to real delivery (email/spam-guard) — launch blocker
- [ ] SEO + OpenGraph images per page; performance pass (Lighthouse > 90)
- [ ] Connect Vercel; launch on subdomain

## License

Source code: [MIT](./LICENSE). **Photographs are © Adamenko Photography — all rights
reserved, not covered by the MIT license.**
