# Status

- 2026-09-18: Built the single-page static site (hero with canvas point cloud,
  capabilities, stack, approach, sectors, company facts, contact). Registered
  as a permanent service on :3021 (`proj-vitall.service`).

  Open before launch: confirm hi@vitall.ai, confirm incorporation year,
  add real team / clients / case studies when available, OG image, analytics
  (if wanted), DNS + static hosting for vitall.ai.

- 2026-09-18 (later): Second pass on request — copy cut to roughly a third,
  tone shifted to terse system-style labels (CAP.01, L1–L5, S.01…), added
  telemetry HUD driven by the point cloud, headline decode, aurora glow,
  cursor light, corner-bracket cards, signal line through the stack.

- 2026-09-18 (later still): Page cut to three blocks on request — hero,
  four capability cards (no descriptions), company facts + contact. Stack,
  process and sectors sections removed. Copy now says "custom AI and
  robotics solutions" explicitly; point cloud denser, orbit rings gone.

- 2026-09-18: Added privacy.html (PDPA-based policy with Meta-style data
  deletion instructions) for Meta business verification, linked from the
  footer. Effective date 18 Sep 2026, v1.0. DPO contact = hi@vitall.ai
  (to confirm).
- 2026-09-18: Added terms.html (Singapore-law terms for the site and
  messaging channels). Contact email changed to hi@vitall.ai everywhere.
  "What we build" nav link and hero button removed.
- 2026-09-18: Contact form added (name, work email, company, project type,
  message, honeypot). No backend yet: FORM_ENDPOINT in site.js is empty so it
  falls back to a pre-filled mailto. Nav button and hero button both say
  "Start a project" and go to the form.
