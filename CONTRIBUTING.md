# Contributing

Thanks for improving Pro Care Qatar.

## Development workflow

1. Install dependencies: `npm install`
2. Run local dev server: `npm run dev`
3. Validate before opening a PR:
   - `npm run check`
   - `npm run build`

## Project standards

- Keep **EN/AR parity**: whenever text keys are added or changed, update both
  `src/i18n/en.json` and `src/i18n/ar.json` in the same commit.
- Keep route wrappers thin (`src/pages/{en,ar}`) and place shared content in
  `src/components/sections`.
- Respect reduced-motion preferences for any new animation work.
- Prefer semantic HTML and accessible labels/roles for interactive elements.

## Commit and PR quality

- Keep commits focused and descriptive.
- Include a concise summary, testing notes, and screenshots for meaningful UI
  changes.
- Do not commit build output (`dist/`) or generated caches.
