# CLAUDE.md

**Vitall** (vitall.ai) — corporate site for Vitall Pte Ltd, an AI and robotics
company based in Singapore. Business project, single-page marketing site.

Company facts (verified, from the founder):
- Legal entity: Vitall Pte Ltd, UEN 202501111C
- Registered office: 7 Temasek Boulevard #12-07 Suntec Tower One, Singapore 038987

## Stack

Plain static HTML/CSS/JS in `site/` — no build step, no framework, no backend.
Served on **:3021** by `scripts/serve.sh` (`python3 -m http.server`, serving
`site/` only), registered in `../_infra/endpoints.csv`, supervised as
`proj-vitall.service`. Edits to `site/` are live on reload; no restart.

```
site/index.html         The whole site: hero, four capability cards, contact form + company facts
site/privacy.html       Privacy policy (PDPA-based; has the data-deletion instructions Meta asks for)
site/terms.html         Terms of service (Singapore law; website + messaging channels)
site/assets/style.css   All styling; tokens at the top. Single dark theme, deliberately.
site/assets/site.js     Mobile nav, scroll reveal, card spotlight, cursor light, headline word-rise, hero point cloud + live HUD readout
```

Fonts come from Google Fonts (Sora / Manrope / JetBrains Mono). Favicon is an
inline SVG data URI in `<head>`.

## Contact form

`#contactForm` on index.html posts JSON to `FORM_ENDPOINT` in `assets/site.js`
(name, email, company, type, message, page). The constant is **empty** — until a
real endpoint (Formspree, Basin, own API) is set, submit falls back to opening a
`mailto:hi@vitall.ai` with the fields pre-filled. Honeypot field `website` drops
bots client-side. Every "Start a project" button/link points at `#contact`.

## Honesty rules

- No invented clients, metrics, testimonials or team members. The site
  describes capabilities and approach only. Keep it that way until real ones exist.
- `hi@vitall.ai` is assumed, not confirmed — verify the mailbox exists before launch.
  It is also the Data Protection Officer contact in privacy.html; a real DPO must be named internally (PDPA).
- privacy.html states the site sets no cookies and runs no analytics. If either is added, update sections 3.3 and 6.
- "Incorporated 2025" is inferred from the UEN prefix; confirm.
- The coordinates in the Company panel are Suntec Tower One's approximate location.

## Deploying to vitall.ai

`site/` is the deployable unit — copy it as-is to any static host. Nothing
outside `site/` should ship.

## Deployment (Railway + GitHub + Namecheap)

- GitHub: `git@github.com:gannicus4431/vitall.git`, branch `main`. Push = deploy.
- Railway builds the `Dockerfile` (nginx:alpine serving `site/`, listens on
  `$PORT` via `deploy/nginx.conf.template`). `railway.json` pins the Dockerfile
  builder. nginx also answers `/privacy` and `/terms` (try_files adds `.html`)
  but internal links stay `privacy.html` / `terms.html` so the same files work
  on the local :3021 python server and the artifact preview.
- Domain: vitall.ai on Namecheap BasicDNS → CNAME/ALIAS to the Railway target
  shown in the service's Settings → Networking → Custom Domain, plus the TXT
  verification record Railway gives. Railway issues the TLS cert itself.
