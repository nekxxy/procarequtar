# MOTION.md — animation system

Every motion primitive in the site, mapped to the file that owns it.
GSAP 3 + ScrollTrigger is the only animation runtime; pure CSS is used where
no scroll/timeline orchestration is needed.

## The Lenis ↔ ScrollTrigger bridge (canonical)

`src/components/react/SmoothScroll.tsx` is the single source of truth. It:

1. Instantiates a global Lenis (`lerp: 0.1`).
2. Forwards every Lenis scroll event to `ScrollTrigger.update`.
3. Drives `lenis.raf` from `gsap.ticker` (so GSAP and Lenis share one frame
   loop, no double-RAF).
4. Refreshes ScrollTrigger after every Astro view-transition swap.
5. Bails out entirely on `prefers-reduced-motion: reduce`.

Never call `gsap.registerPlugin` outside `src/lib/gsap.ts`.

## Primitives

| Primitive | Library | File | Trigger | Easing | Duration | RTL behaviour | Reduced-motion |
|---|---|---|---|---|---|---|---|
| Smooth scroll | Lenis 1.1 | `react/SmoothScroll.tsx` | always-on | linear lerp `0.1` | n/a | direction-agnostic | disabled (native scroll) |
| Hero headline split | GSAP | `react/SplitText.tsx` | `top 85%` | `expo.out` | 1.0s | char order respects writing direction | end-state immediately |
| Hero rotator | GSAP | `react/HeroRotator.tsx` | interval `2400ms` | `expo.in` / `expo.out` | 0.55s / 0.7s | text re-flows naturally | static word |
| Section reveal stagger | GSAP | `react/RevealOnScroll.tsx` | `top 85%` | `expo.out` | 0.9s, stagger `0.08s` | identical | end-state immediately |
| Magnetic button | GSAP `quickTo` | `react/MagneticButton.tsx` | pointer | `expo.out` | 0.4s wrap / 0.55s inner | identical | disabled |
| Custom cursor | GSAP `quickTo` + `mix-blend-mode` | `react/Cursor.tsx` | pointer | `expo.out` | 0.18s dot / 0.55s ring | identical | disabled |
| Preloader | GSAP timeline | `react/Preloader.tsx` | first paint, sessionStorage gated | `expo.out` / `expo.inOut` | 1.6s + 1.0s | identical | skipped |
| Parallax image | GSAP scrub | `react/ParallaxImage.tsx` | `top bottom` → `bottom top` | `none` (linear scrub) | scroll-bound | identical | static (no transform) |
| Horizontal services | GSAP pin + scrub | `react/HorizontalServices.tsx` | `top top`, `+= track distance` | `none` | scroll-bound | sign flipped via `useDirection` | bypassed (vertical stack) |
| Theme morph | GSAP via attribute | `react/ThemeMorph.tsx` | each section enters viewport | CSS transition on body | 0.6s | identical | snaps without transition |
| Stats counters | GSAP `+=` snap | `react/StatsCounter.tsx` | `top 85%` | `expo.out` | 1.6s | identical (numerals) | jumps to final value |
| Marquee bands | Pure CSS keyframes | `astro/Marquee.astro` | always | linear | configurable speed | reverses via `[dir="rtl"]` | `animation: none` |
| Mobile menu | GSAP timeline | `react/MobileMenu.tsx` | toggle | `expo.out` / `expo.inOut` | 0.7s panel + 0.6s items | identical (clip-path) | instant open/close |
| Page transitions | View Transitions API | `BaseLayout.astro` | route change | UA default | UA default | identical | UA respects setting |

## RTL strategy for horizontal motion

In Latin/LTR pages, horizontal scrollers translate the track in the
**negative** x direction (track moves left as user scrolls down → cards enter
from the right). In Arabic/RTL, content reads right-to-left so the track must
translate in the **positive** x direction.

`useDirection()` reads `<html dir>` and returns `{ dir, sign }` where
`sign === 1` for RTL and `sign === -1` for LTR. Multiply your translate by
`sign` and the same code path renders correctly in both modes.

The marquee uses CSS only: `animation-direction: reverse` is applied under
`[dir="rtl"]` selector inside `Marquee.astro`.

## Mobile

- Custom cursor: disabled on `(pointer: coarse)`.
- Preloader: skipped on `prefers-reduced-motion`; shown only on first session.
- Horizontal services: vertical stack on `<768px` (the pin tween early-returns).
- Magnetic button: disabled on touch.
- Parallax: still active but range is implicit-clipped by smaller viewports.

## Performance budget

- All transforms run on `transform` and `opacity` only (GPU compositor).
- `will-change: transform` is applied to actively animated nodes only —
  never globally.
- GSAP and Lenis bundles together gzip ~50 KB. Hero JS (excluding GSAP)
  budget: ≤40 KB.
- Targets: LCP ≤ 2.0s on 4G mobile, INP ≤ 150ms, CLS ≤ 0.05.

## Adding a new motion primitive

1. Use `useGsap(scopeRef, () => …, [deps])` from `src/hooks/useGsap.ts`.
2. Bail early on reduced-motion / touch where applicable.
3. Document the row in this table.
4. Verify both `/en` and `/ar` routes — if the animation has a horizontal
   component, multiply by `useDirection().sign`.
