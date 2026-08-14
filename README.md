# jeniussystems.ai

Static site for **jenius Systems**, served by GitHub Pages (branch `main` = production; merging to
main deploys). No build step — every file here is served as-is.

## Layout

| Path | What it is |
| --- | --- |
| `/` (`index.html` + `assets/hub.css`) | Landing page: OpenDyslexic wordmark + tagline + builds list. Zero JS. |
| `/construction/` | construction draw management — case notes (app at construction.jeniussystems.ai, behind Cloudflare Access; login link only). |
| `/sandbox/` | The fleet architecture overview (the pre-2026-08 site; body untouched, head/nav adapted — its pinned inline-script hash is byte-identical). |
| `/data/fleet.json` | **Contract path** — written by a private roster-sync pipeline that lives outside this repo. Must stay at the repo root; `/sandbox/` fetches it absolutely. |
| `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` | Root meta files. |

## Adding a build

1. Copy the commented `TEMPLATE` `<li>` block in `index.html` (inside `.builds`).
2. Pick an honest status chip: `LIVE` (add class `chip-live`), `PRIVATE PILOT`, `R&D SANDBOX`, or similar-but-true.
3. Add the URL to `sitemap.xml` and a line to `llms.txt` if it gets its own page.
4. Voice: lowercase, personal, one or two sentences — claim only what's real.

Fonts: OpenDyslexic (SIL OFL) self-hosted in `assets/fonts/` — the wordmark/headers and italic
tagline depend on it; don't swap it out casually, it's part of the identity.

House rules: claim only what's live (gated/private things say so), no sales or signup language,
and the "j" in jenius is always the lowercase cursive glyph (`.brand-j`).

## Security posture

Every page sets a strict CSP via `<meta>`; the landing pages (`/`, `/construction/`, `404`) have **no JS
at all, no inline styles, and no third-party requests** (fonts are self-hosted) — keep
`script-src 'self'`/`style-src 'self'`/`font-src 'self'` intact when editing. `/sandbox/` carries
its own legacy CSP with one hashed inline script; if you edit that script, recompute the hash.
