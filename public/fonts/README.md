# Self-hosted fonts

The app references variable fonts from this directory. Download the official
files and place them here with these exact names:

| File | Source |
|---|---|
| `Geist-Variable.woff2` | https://vercel.com/font/sans (export the variable woff2) |
| `Inter-Variable.woff2` | https://github.com/rsms/inter/releases (`Inter-roman.var.woff2`, rename) |
| `IBMPlexSansArabic-Regular.woff2` | https://github.com/IBM/plex Arabic family |
| `IBMPlexSansArabic-Bold.woff2` | https://github.com/IBM/plex Arabic family |

The `@font-face` declarations live in `src/styles/global.css`. Until the files
are present the browser falls back to `system-ui` (typography still works,
just with the system stack). All files are licensed under SIL OFL and free to
ship.

Once added, run `npm run build` and verify in DevTools Network tab that the
font requests return 200, not 404.
