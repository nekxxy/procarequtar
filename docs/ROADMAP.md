# ROADMAP.md — Pro Care Qatar redesign

## v1 — shipped (this commit)

**Scope**: Astro 5 + React + Tailwind v4 + GSAP + Lenis. Bilingual EN/AR
mirror. Hybrid light-hero / dark-deep-dive aesthetic. Placeholder copy
derived from the Qatar commercial registry.

Done:

- 20 static routes across two locales
- Hero with SplitText reveal, headline rotator, magnetic CTAs
- Trust marquee (CSS-only, RTL-aware)
- Horizontal scroll-pinned services showcase
- Theme morph (light → dark on scroll, driven by ScrollTrigger)
- Featured projects parallax grid
- Stats counters
- About teaser, full About page with values + registry block
- Filterable Projects gallery
- Contact page with mailto-fallback form
- Custom blend-mode cursor + first-load preloader
- Mobile menu (clip-path reveal)
- Astro View Transitions wired to Lenis refresh
- Reduced-motion handling everywhere
- Sitemap + hreflang alternates
- Six docs files (`CLAUDE`, `DESIGN`, `MOTION`, `STACK`, `i18n`, `ROADMAP`)

## v1.1 — content + assets (1–2 days when client provides)

- Replace placeholder copy with client-supplied marketing text in both EN
  and AR. Drop into `src/i18n/{en,ar}.json` directly.
- Add real photography to project cards (Astro `<Image>` AVIF/WebP).
- Add the official Pro Care logo SVG; replace the placeholder mark in
  `src/components/astro/Logo.astro`.
- Self-host the four font files into `public/fonts/`. See
  `public/fonts/README.md` for sources.
- Wire the contact form to Web3Forms or Formspree (replace the mailto
  fallback in `ContactForm.tsx`).
- Add real phone / email / WhatsApp numbers to `Footer.astro` and
  `ContactContent.astro`.
- Run Lighthouse mobile, capture LCP/INP/CLS. Target ≥ 92 perf.

## v2 — depth + delight (1 week)

- WebGL hover image distortion on project cards (Three.js or OGL,
  displacement-map ripple). Adds ~80 KB; lazy-load behind
  `IntersectionObserver`.
- Case study pages — long-form per-project layout with pinned image stacks,
  before/after sliders, scope tables.
- A simple blog or insights index (Astro content collections, MDX).
- WhatsApp Business integration with click-to-chat that pre-fills service
  context from the page.
- Trust strip with live "Last project handed over <relative date>"
  (sourced from a JSON file, no backend required).

## v3 — backend + ops (2–3 weeks)

- CMS integration: Sanity, Contentful, or Decap. Editors update copy +
  projects without code changes.
- Quote calculator / configurator with a serverless POST endpoint (Vercel
  Functions / Cloudflare Workers).
- Auth-gated client portal (project status, invoices, FM tickets).
- Analytics: Plausible or Umami (privacy-first, no cookies).
- A/B test the hero rotator vs static headline (PostHog feature flag).

## Quality gates (every release)

- `npm run typecheck` — zero errors.
- `npm run build` — completes; no console warnings about missing assets.
- Lighthouse mobile ≥ 92 perf, ≥ 95 a11y, ≥ 95 SEO, ≥ 95 best practices.
- Manual: tab through the site, verify focus rings, verify
  `prefers-reduced-motion` skip behaviour, verify both locales side-by-side.
- Real-device test on iOS Safari (Lenis is mobile-sensitive) and a
  mid-tier Android.
