# STACK.md — pinned versions and rationale

| Concern | Choice | Version | Why this, not the alternative |
|---|---|---|---|
| Framework | Astro | `^5` | Ships ~0kb JS by default; perfect for marketing/SEO. React islands hydrate only the interactive bits. Beats Next.js for marketing-only sites because we don't need a server runtime. |
| UI runtime | React | `^19` | The user has React knowledge and the wider ecosystem fits. We considered Svelte (smaller bundles) and Solid; React won on familiarity + GSAP + shadcn-pattern compatibility. |
| Styling | Tailwind CSS | `^4` (`@tailwindcss/vite`) | CSS-first `@theme` block keeps tokens in one CSS file. Native `rtl:`/`ltr:` variants and logical properties make bilingual support cheap. |
| Animation | GSAP | `^3.12` | Free since 2024 under Webflow. ScrollTrigger + SplitText cover every primitive we need. We rejected Framer Motion to avoid a second runtime; rejected Anime.js for missing scroll plugins. |
| Smooth scroll | Lenis | `^1.1` | The Awwwards-grade default. Bridges to ScrollTrigger via `gsap.ticker`; documented in `MOTION.md`. |
| Page transitions | Astro `<ClientRouter />` | built-in 5.x | Hardware-accelerated, zero-config, replaces Barba.js. |
| Forms | Mailto fallback (current) → Web3Forms (later) | n/a | No backend in v1. Form submits by composing a `mailto:` link with the data so the contact channel works immediately. v1.1 swaps in Web3Forms / Formspree for inbox delivery. |
| Sitemap | `@astrojs/sitemap` | `^3` | Generates `sitemap-index.xml` + per-locale sitemaps automatically. |
| Type checking | `@astrojs/check` | `^0.9` | Wraps `tsc` with `.astro` support. Run via `npm run typecheck`. |
| Utility | `clsx` + `tailwind-merge` | `^2` | The `cn()` helper in `src/lib/cn.ts`. |

## Dependencies map

```
runtime hot path:
  astro → react / react-dom (only on islands)
       → gsap + ScrollTrigger (lib/gsap.ts)
       → lenis (SmoothScroll.tsx)
  styling:
       → tailwindcss (Vite plugin)
       → tailwind-merge + clsx (cn helper)

build:
  @astrojs/check (typecheck)
  @astrojs/sitemap (sitemap-index.xml)
  @astrojs/react (jsx-runtime)
```

## Bundle expectations

After `npm run build`, per-page JS is roughly:

- Home: ~210 KB raw / ~70 KB gzip (React + GSAP + Lenis + section islands)
- Service detail: ~180 KB raw / ~60 KB gzip
- Static-only pages with simple islands: ~80 KB raw / ~25 KB gzip

Astro chunks per-route, so users only pay for the islands that page uses.

## Deployment

The build emits a fully static `dist/` directory. Compatible with:

- **Vercel** — drop in, works. Add `@astrojs/vercel` adapter if you want
  ISR or middleware (not currently needed).
- **Cloudflare Pages** — works as static.
- **Netlify** — works as static.
- **Static S3 + CloudFront / any CDN** — works.

`/` redirects to `/en/` via `src/pages/index.astro`. Add a CDN-level redirect
from `/` → `/en/` if you want zero-cost (avoid the Astro 308 round-trip).

## Versioning policy

- Major upgrades: open a PR, run `npm run typecheck && npm run build`, smoke
  test both locales.
- Minor / patch: bump in `package.json`, run the same checks.
- Astro 5 → 6 will land mid-2026; expect a ~1 day migration when it does.
- GSAP 3 → 4: not announced. Stay on 3.

## Security

- No backend = no auth surface in v1.
- Contact form opens user's mail client; nothing is sent server-side.
- No `dangerouslySetInnerHTML`, no `eval`, no third-party iframes.
- Self-hosted fonts only.
