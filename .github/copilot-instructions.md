# Copilot / AI Agent Instructions for ElemonatorGames.github.io

## Quick context
- This is a small **Astro** static site (see `package.json`) deployed to **GitHub Pages** via `.github/workflows/deploy.yml` (uses `withastro/action@v5`).
- There is a separate **Cloudflare Worker** (serverless function) under `functions/` that handles contact form submissions and uses the Resend API to send emails.
- TypeScript is enabled and uses `astro/tsconfigs/strict` (`tsconfig.json`) — prefer strict types when adding code.

## Local dev & build
- Standard commands (run from repo root):
  - `npm install` — install deps
  - `npm run dev` — run Astro dev server (localhost:4321)
  - `npm run build` — build static site to `dist/`
  - `npm run preview` — preview a production build

Notes for agents:
- The site is minimal and pages live in `src/pages/`. Use `src/layouts/Base.astro` for shared layout patterns.
- Styling tokens are in `src/styles/tokens.css`.

## Contact worker (Cloudflare) — important details
- Worker files: `functions/src/contact.ts` and config `functions/wrangler.toml`.
- Required environment variables (declared in `wrangler.toml`):
  - `RESEND_API_KEY` (secret) — **do not** commit to git. Must be set via `wrangler secret put RESEND_API_KEY` or set in Cloudflare dashboard.
  - `TO_EMAIL` — destination email (e.g., `elemonatorgames@gmail.com`).
  - `FROM_EMAIL` — sender email; must be verified with Resend if required.
  - `ALLOW_ORIGIN` — origin allowed for CORS (defaults to `https://elemonatorgames.github.io`).

Worker behavior and constraints (see `functions/src/contact.ts`):
- Accepts only `POST` (and `OPTIONS` preflight) and rejects invalid origins.
- Basic anti-spam checks:
  - Honeypot field named `company` (hidden input in the form)
  - A `token` must equal `egi-v1`
  - `ts` timestamp must exist and not be too recent (<4s)
- When sending, it performs a POST to `https://api.resend.com/emails` with `Authorization: Bearer ${RESEND_API_KEY}`.
- On success, worker redirects to `/thanks` on the allowed origin.

Agent tasks related to the worker:
- When changing form fields, update `src/pages/index.astro` form inputs to match worker parsing (`name`, `email`, `message`, `company`, `token`, `ts`).
- For local worker testing, use `wrangler dev` or Cloudflare's dashboard/dev tools; the repository does not contain an automated worker deployment step.

## Deployment notes
- GitHub Pages deployment is automated on pushes to `main` using `.github/workflows/deploy.yml`.
- Worker deployment is manual/independent. Use Wrangler (`wrangler publish`) or Cloudflare UI; ensure `RESEND_API_KEY` is configured as a secret in Cloudflare.
- The form’s action currently points to `https://egi-contact-worker.elemonatorgames.workers.dev/contact`. If you rename the worker or change routes, update this URL in `src/pages/index.astro`.

## Conventions & patterns worth preserving
- Keep code minimal and accessible (semantic HTML, skip links, visible labels) — `src/layouts/Base.astro` and the form in `src/pages/index.astro` show this.
- Communication with external services is done server-side in the worker; avoid embedding API keys in client code.
- Use simple anti-spam measures already implemented in the worker when modifying contact behavior.
- Follow TypeScript strictness (`astro/tsconfigs/strict`) for new TS code.

## Recent UI changes (important for agents)
- Implemented a small UI polish focused on the contact form and project listings:
  - Contact form: boxed card layout, stacked inputs, improved client-side submit UX (spinner, errors, timestamp updates)
  - Buttons: `.btn--primary`, `.btn--ghost`, improved focus/hover states
  - Project cards: `.card-grid`, `.project-card`, using `public/placeholders/800x450.svg` as temporary art
  - Navigation: `.nav` active link detection and accessible focus state
  - Accessibility: stronger focus ring, explicit error status styles (`.form-status--error`), and aria-live handling for form messages
- Keep these tokens and classes in mind when making CSS or layout changes: `src/styles/tokens.css` contains core tokens and component utilities used across pages.

## How to test contact form locally (quick steps)
- Start the site: `npm run dev` (Astro prints the local port — default 4321, but it may increment if already in use).
- Worker: run a local worker for end-to-end tests: `cd functions && wrangler dev` (or set `ALLOW_ORIGIN` to `http://localhost:<port>` for a test worker). Use a test `RESEND_API_KEY` (set with `wrangler secret put RESEND_API_KEY`) or a stubbed endpoint to avoid sending real emails during tests.
- Test matrix:
  - JS enabled: verify spinner, disable-on-submit, success redirect to `/thanks`, and friendly inline errors on failure.
  - JS disabled: verify the form gracefully falls back to a normal POST and the worker handles it server-side.
  - Honeypot/token/ts: ensure the worker rejects spam cases (honeypot filled, token missing or ts too recent).
- CORS note: the worker checks `Origin` against `ALLOW_ORIGIN` — update `wrangler.toml` or `ALLOW_ORIGIN` for local dev if needed.

## PR checklist suggestions
- Include a short testing notes section in PRs describing how you tested the contact flow (JS on/off, worker tests, and any stubbing).
- Add one or two screenshots for visual changes (hero, contact card, projects grid) and mention the browsers / devices tested (Chrome primary, Edge, Firefox; desktop + mobile).

## When writing PRs / changes
- Validate the site locally with `npm run dev` and check the contact form behavior in staging or with a test worker deployment.
- If modifying worker behavior, provide instructions in your PR on how to set necessary secrets and how to test the change.

## Quick file map (useful references)
- `package.json` — scripts and dependencies
- `src/pages/index.astro` — contact form and client-side ts timestamp
- `src/layouts/Base.astro` — site layout and accessibility patterns
- `functions/wrangler.toml` — worker config and env var notes
- `functions/src/contact.ts` — worker implementation and validation logic
- `.github/workflows/deploy.yml` — automatic GitHub Pages deployment

---
If anything above is unclear or you'd like additional, more detailed snippets (e.g., example `wrangler` commands, a sample local worker test flow, or typical PR checklist items), tell me which part to expand and I’ll iterate.