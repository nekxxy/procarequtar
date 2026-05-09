# Pro Care Qatar

Bilingual (EN / AR) marketing site for **Pro Care Trading Contracting and
Facility Services**, Doha, Qatar.

Built with Astro 5 + React 19 + Tailwind v4 + GSAP 3 + Lenis. Static-first,
animation-heavy, designed to leap ahead of the local competition.

## Quick start

```bash
npm install
npm run dev          # → http://localhost:4321
npm run build        # → static dist/
npm run preview
npm run typecheck
npm run check
```

`/` redirects to `/en/`. The Arabic mirror lives under `/ar/`.

## Where to look

- **Routes** — `src/pages/{en,ar}/**`. Each is a thin wrapper around a
  shared partial in `src/components/sections/`.
- **Design tokens** — `src/styles/global.css` (`@theme { … }` block). The
  single source of truth for colours, type scale and easings.
- **Translations** — `src/i18n/{en,ar}.json`. Identical shape; add keys to
  both in the same commit.
- **Motion** — every animation primitive is documented in
  `docs/MOTION.md` with timing, easing, RTL behaviour and reduced-motion
  fallback.

## Engineering quality

- Continuous integration runs type-check + build on every pull request via `.github/workflows/ci.yml`.
- Contributor expectations are documented in `CONTRIBUTING.md`.
- Formatting defaults are standardized via `.editorconfig`.

## Documentation

| File | Purpose |
|---|---|
| `docs/CLAUDE.md` | Operating manual — read first |
| `docs/DESIGN.md` | Visual system: colour, type, layout, motifs |
| `docs/MOTION.md` | Every motion primitive, mapped to its file |
| `docs/STACK.md` | Pinned versions, rationale, deployment |
| `docs/i18n.md` | Bilingual conventions, RTL strategy |
| `docs/ROADMAP.md` | v1 (shipped) → v1.1 → v2 → v3 |

## Self-hosted assets to add

- Fonts → `public/fonts/`. See `public/fonts/README.md` for the four files
  the site references (Geist, Inter, IBM Plex Sans Arabic ×2). Until they
  exist the browser falls back to `system-ui`.
- Real photography → drop into `public/og/` and `public/projects/` and wire
  via Astro `<Image>`.
- Real Pro Care logo → replace `src/components/astro/Logo.astro`.

## Deploy

The `dist/` build is fully static. Drop into Vercel, Cloudflare Pages,
Netlify, or any S3/CDN. Add a CDN-level redirect from `/` → `/en/` to skip
the runtime 308 hop.
