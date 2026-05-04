# CLAUDE.md — operating manual for this codebase

Purpose: keep this codebase agent-maintainable. Read this before editing.

## Stack invariants

- **Framework**: Astro 5 (`astro.config.mjs`). Static-first.
- **Interactive**: React 19 islands, hydrated via `client:load`, `client:idle`,
  or `client:visible` directives.
- **Styling**: Tailwind v4 via `@tailwindcss/vite`. Tokens are in
  `src/styles/global.css` under the `@theme { … }` block — that is the single
  source of truth. **Do not** add a `tailwind.config.{js,ts}` for tokens.
- **Animation**: GSAP 3 + ScrollTrigger only. **Do not** introduce Framer
  Motion / Motion / Anime.js / React Spring — keeping a single animation
  runtime keeps the bundle small.
- **Smooth scroll**: Lenis, mounted exactly once via
  `src/components/react/SmoothScroll.tsx`. Do not mount a second instance.
- **Page transitions**: Astro View Transitions (`<ClientRouter />`).
- **i18n**: `/en/*` and `/ar/*` mirror each other. Locale prefix is required
  on every URL (`prefixDefaultLocale: true`).

## Hard rules

1. **Logical properties only.** `ms-`/`me-`/`ps-`/`pe-` (margin-inline-start,
   etc.) — never `ml-`/`mr-`/`pl-`/`pr-`. RTL must work without code edits.
2. **GSAP must run inside `gsap.context()`.** Always use `useGsap(scopeRef, …)`
   from `src/hooks/useGsap.ts`. The hook also kills timelines on
   `astro:before-swap` so View Transitions don't leak DOM references.
3. **Direction-aware horizontal motion**: never hardcode negative `x:`. Use
   `useDirection()` and multiply by `sign`.
4. **Reduced motion is honoured everywhere.** Cursor, Preloader, Lenis, and
   all GSAP timelines must short-circuit on
   `prefers-reduced-motion: reduce`. The CSS layer also blanks animations.
5. **No client JS in Astro components when CSS suffices.** `Marquee.astro` is
   the canonical example — pure CSS keyframes, no JS, RTL-flips via
   `[dir="rtl"]`.
6. **Translations go through `t()` / `tn()`** in `src/i18n/utils.ts`. Never
   hardcode user-facing copy in components.
7. **Generic call sites in JSX**: use `t(lang, "key")` (always returns
   string) inside template `{...}` expressions. `tn<T>(...)` is fine in
   Astro frontmatter (between `---` fences) but breaks the JSX parser in
   the body — Astro reads `<T>` as a JSX tag.

## File map

| Path | Role |
|---|---|
| `astro.config.mjs` | Integrations + i18n routing |
| `src/styles/global.css` | Tokens, fonts, base styles, reduced-motion |
| `src/layouts/BaseLayout.astro` | `<html lang dir>`, fonts, ViewTransitions, mounts SmoothScroll/Cursor/Preloader |
| `src/lib/gsap.ts` | Plugin registration, the only place that calls `gsap.registerPlugin` |
| `src/components/react/SmoothScroll.tsx` | Lenis ↔ ScrollTrigger bridge — canonical |
| `src/hooks/useGsap.ts` | Scoped `gsap.context()` + auto-cleanup on view-transition |
| `src/hooks/useDirection.ts` | Reads `<html dir>` and exposes a `sign` for x-translates |
| `src/hooks/useReducedMotion.ts` | `matchMedia` listener |
| `src/i18n/utils.ts` | `t`, `tn`, `getLangFromUrl`, `getDir`, `localizedHref` |
| `src/components/sections/*.astro` | Reusable page sections, take `lang` prop |
| `src/pages/{en,ar}/**` | Thin wrappers — `<BaseLayout lang="…"><Section lang="…" /></BaseLayout>` |
| `docs/*.md` | This file + DESIGN, MOTION, STACK, i18n, ROADMAP |

## Adding a new page

1. Add a partial under `src/components/sections/<NewSection>.astro` taking
   `lang: Locale` as prop.
2. Add `src/pages/en/<route>.astro` and `src/pages/ar/<route>.astro` that
   each render `<BaseLayout lang="…"><NewSection lang="…" /></BaseLayout>`.
3. Add translation keys to `src/i18n/en.json` and `src/i18n/ar.json` with the
   same shape.
4. Add the navigation link to `src/components/astro/Header.astro`.

## Adding a new motion primitive

1. Create the React component under `src/components/react/`.
2. Use `useGsap(ref, () => …, [deps])` for any GSAP work.
3. Bail out early on `prefers-reduced-motion` and `(pointer: coarse)` where
   the interaction is desktop-only (cursor, magnetic button).
4. Document it in `docs/MOTION.md` with timing/easing/RTL behaviour.

## Commands

```bash
npm run dev         # vite dev server, HMR
npm run build       # astro check && astro build → static dist/
npm run preview     # serve dist/ locally
npm run typecheck   # astro check (no build)
```

## Branch + commit policy

- Develop on the branch `claude/research-design-web-app-06lMi` (configured by
  the harness).
- Commits should describe *why*, in one line. Conventional-commits style is
  fine: `feat: … / fix: … / docs: …`.
- Never force-push, never amend pushed commits.
