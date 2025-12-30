# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-12-29
### Added
- Contact form: updated UI to a boxed card layout with stacked fields and improved client-side submit UX (spinner, error messages, TS timestamp refresh).
- Buttons: added `.btn--primary` and `.btn--ghost` variants; improved focus/hover transitions.
- Projects: added responsive `.card-grid` and `.project-card` components; placeholder images in `public/placeholders/`.
- Navigation: active link detection and accessible focus states.
### Changed
- Accessibility improvements: stronger focus rings, explicit error states (`.form-status--error`), and better keyboard/ARIA handling for the contact form.
### Testing notes
- Run `npm run dev` and `cd functions && wrangler dev` (or deploy a test worker) to test the end-to-end contact flow.
- Ensure `RESEND_API_KEY` is set as a worker secret when testing sending; use a test/stub key to avoid sending real emails during development.
