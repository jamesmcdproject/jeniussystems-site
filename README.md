# jeniussystems.ai

Static site for **jenius Systems**, served by GitHub Pages (branch `main` = production; merging to
main deploys). No build step — every file here is served as-is.

## Layout

| Path | What it is |
| --- | --- |
| `/` (`index.html` + `assets/hub.css`) | Landing page: OpenDyslexic wordmark + statement, then three sections — "the day job, automated" (finance builds), "how the work goes" (method), "off the clock" (games). Zero JS. |
| `/construction/` | construction draw management — case notes (app at construction.jeniussystems.ai, behind Cloudflare Access; login link only). |
| `/sandbox/` | The fleet architecture overview (the pre-2026-08 site; body untouched, head/nav adapted — its pinned inline-script hash is byte-identical). |
| `/data/fleet.json` | **Contract path** — written by a private roster-sync pipeline that lives outside this repo. Must stay at the repo root; `/sandbox/` fetches it absolutely. |
| `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` | Root meta files. |

## Adding a build

1. Copy the commented `TEMPLATE` `<li>` block in `index.html` into the right `.builds` list: "the day job, automated" for finance/ops builds (add an `.entry-no` line; a `.spec` list is optional; use `<span class="build-name">` instead of a link while there is no page), "off the clock" for games. Update the counts in the hero `.status` strip.
2. Pick an honest status chip: `LIVE` (add class `chip-live`), `PRIVATE PILOT`, `IN BUILD`, `R&D SANDBOX`, or similar-but-true.
3. Add it to the JSON-LD list in `index.html` and to `llms.txt`; add the URL to `sitemap.xml` if it gets its own page here.
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
