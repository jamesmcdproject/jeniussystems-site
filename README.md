# jeniussystems.ai

Static site for **jenius Systems**, served by GitHub Pages (branch `main` = production; merging to
main deploys). No build step — every file here is served as-is.

## Layout

| Path | What it is |
| --- | --- |
| `/` (`index.html` + `assets/hub.*`) | Hub landing page: studio hero + project grid. |
| `/built/` | BMC Development case notes (no public app exists). |
| `/sandbox/` | The fleet architecture overview (the pre-2026-08 site, moved verbatim). |
| `/data/fleet.json` | **Contract path** — written by a private roster-sync pipeline that lives outside this repo. Must stay at the repo root; `/sandbox/` fetches it absolutely. |
| `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` | Root meta files. |

## Adding a project card

1. Copy the commented `TEMPLATE` `<article>` block in `index.html` (inside `.grid`).
2. Drop a real screenshot at `assets/shots/<name>.jpg` (~1200×750, ≤150 KB).
3. Pick an honest status badge: `LIVE` (add `badge-live`), `PRIVATE PILOT`, or `R&D SANDBOX`.
4. Add the URL to `sitemap.xml` and a line to `llms.txt` if it gets its own page.
5. Grid spans: default card = 5 columns, `card-feature` = 7, `card-wide` = 12.

House rules: claim only what's live (gated/private things say so), no sales or signup language,
and the "j" in jenius is always the lowercase cursive glyph (`.brand-j`).

## Security posture

Every page sets a strict CSP via `<meta>`; the hub pages (`/`, `/built/`, `404`) have **no inline
JS and no inline styles** — keep `script-src 'self'` intact when editing. `/sandbox/` carries its
own legacy CSP with one hashed inline script; if you edit that script, recompute the hash.
