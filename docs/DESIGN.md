# DESIGN.md — visual system

A hybrid editorial light + immersive dark site for Pro Care Trading Contracting
and Facility Services (Doha, Qatar). The hero and content surfaces sit on a
warm-bone canvas; deep-dive sections (services showcase, projects, footer,
CTA) drop into near-black with a saturated accent.

## Surfaces

| Token | Light | Dark |
|---|---|---|
| `--color-bg` / `--color-bg-dark` | `#F4F1EC` warm bone | `#0B0B0A` near-black |
| `--color-fg` / `--color-fg-dark` | `#0E0E0C` ink | `#EFECE5` paper |
| `--color-muted` / `--color-muted-dark` | `#6B6760` | `#8A857C` |
| `--color-line` / `--color-line-dark` | `#DAD3C7` hairline | `#1D1D1A` |

Surface switching is driven by `<ThemeMorph />` — every section has a
`data-theme-section="light|dark"` attribute, and ScrollTrigger swaps
`<html data-theme>` as the section enters the viewport. The `body` gets a
soft 600ms transition, which produces a subtle ambient morph rather than a
hard flip.

## Accents

| Token | Hex | Use |
|---|---|---|
| `--color-accent` | `#FF5B1F` signal orange | Primary CTAs, focus rings, scroll dot, marquee accent band |
| `--color-accent-2` | `#C8FF3E` electric lime | Hover state on solid CTAs, dark-only highlights |
| `--color-accent-3` | `#6C5CE7` violet | Secondary ambient gradient orb in hero |

Avoid maroon/burgundy — that's the competitor's palette and feels Ministry-of-
Commerce-form-ish. Signal orange is unclaimed in the Qatar facilities space and
reads as confident, contemporary, slightly editorial.

## Typography

- **Display**: Geist Variable, weights 100–900, tracking −0.02em, line-height
  1.02 for the largest headlines.
- **Body**: Inter Variable, weights 400 (body) / 500 (UI), tracking 0,
  line-height 1.45.
- **Mono accent**: JetBrains Mono / system mono for eyebrows, codes, badges.
  Always uppercase, tracking +0.18em–+0.30em.
- **Arabic**: IBM Plex Sans Arabic — metrically tuned to Plex Latin and pairs
  acceptably with Geist/Inter. We drop Arabic display weight by one step
  (700 → 600) via `:lang(ar)` to compensate for heavier glyphs.

Self-host all four font files in `public/fonts/`. See
`public/fonts/README.md` for sources. Until those files are added, the
browser falls back to `system-ui` thanks to `font-display: swap` —
typography is still readable, just less distinctive.

### Type scale (fluid)

`clamp()`-driven. The hero uses `--text-9xl` (5–11rem range), section H2 uses
`--text-5xl`, body sits at `--text-base` (1–1.0625rem), eyebrows at
`--text-xs` (0.75–0.8125rem). Defined in `@theme` block in `global.css`.

## Layout

- **12-column grid** at desktop, 1-column on mobile. Use `grid-cols-12` with
  `md:col-span-N` for editorial layouts.
- **Container max width** `100rem` (1600px). Pad with `px-6 md:px-10`.
- **Vertical rhythm**: section paddings climb in 8px steps —
  `py-24 md:py-32 md:py-40 md:py-44`. Hero gets `pt-44 md:pt-56` to clear
  the floating header.
- **Asymmetry preferred** — hero CTAs left-aligned, eyebrow on a different
  column from the headline, intro 5/7 split for about / contact.

## Motifs

- **Grain overlay** — `.grain` utility lays an SVG noise filter at 35%
  opacity over light hero/section surfaces. Stops the bone canvas feeling
  flat.
- **Ambient gradient orbs** — large blurred radial gradients positioned off-
  edge in hero and CTA sections. Two complementary colours per section
  (orange + violet on home hero).
- **Glassmorphic header** — translucent floating header with `backdrop-filter:
  blur(14px)`. Lives in a `.glass` utility class.
- **Hairline borders** — `1px` borders use
  `color-mix(in srgb, var(--fg) 12%, transparent)` so they adapt to surface.
- **No drop shadows.** Depth comes from layered transparency, blur and
  gradient orbs, not box-shadow.

## Spacing scale

8px base. Tailwind's default scale is preserved (`gap-2`, `p-6`, `mt-10`,
etc.). Anything decorative above 80px is fluid via `md:` prefixes.

## States

- **Hover**: subtle `text-[var(--color-accent)]` swap, `gap-2 → gap-3` arrow
  nudge, `scale` only on radial gradient overlays inside cards. No hover
  scale on text.
- **Focus**: `outline: 2px solid var(--color-accent); outline-offset: 4px`
  (set in `@layer base` for `:focus-visible`).
- **Active**: identical to hover; we don't darken on press.
- **Disabled**: `opacity-60` and `pointer-events-none` (forms only).

## Iconography

In-line SVGs sized at 14–18px, `stroke-width: 1.5`, rounded line caps. The
right-arrow CTA glyph (used in service cards, footer) flips horizontally
under `[dir="rtl"]` via the utility class `rtl:rotate-180`.

## Imagery (when added)

Until photography is supplied, projects render as gradient-tinted cards with
metadata. When real assets land:

- AVIF + WebP via Astro `<Image>`.
- Aspect ratios: `4/5` for project cards, `16/9` for case studies, `1/1` for
  team headshots.
- Treatment: a soft duotone overlay (orange + ink) on hover via
  `mix-blend-mode: multiply` to keep the editorial feel.
