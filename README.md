# Terra Indomita — Events Landing (Portfolio)

A fast, resilient marketing site with a calendar-based events experience. The static frontend deploys on Cloudflare Pages; content is managed in a self-hosted Directus CMS/API that’s safely exposed through Cloudflare Tunnel and protected with Zero Trust for admin access.

## Live / Demo
- Production (active): https://terra-indomita.ca
- Staging (active): https://test.terra-indomita.ca
- Public API (read): https://api.terra-indomita.ca/items/events
- Admin (protected): https://admin.terra-indomita.ca

## Highlights (Why this is a good portfolio project)
- Full stack ownership: product, frontend, backend, DevOps, security.
- Resilient UX: calendar shows friendly fallbacks if the API is slow or unavailable.
- Secure by design: no public origin ports; admin behind Cloudflare Access.
- Performance-aware: static edge delivery + short TTL cache on event data.
- Clean repo and docs: initiation → infra → CMS → API → frontend → migration.

## Features
- Calendar view with month navigation; today highlighted by default.
- Colored indicators for days with events (upcoming/current/past).
- Click a day to open an accessible overlay with event details (title, time range, location, description, featured image).
- Graceful fallback: hides the calendar and shows a clear message on API failure.
- Skeleton loading: shimmering placeholder grid while fetching events.

## Architecture
- Frontend: static `index.html` + CSS, deployed via Cloudflare Pages.
- CMS/API: Directus on my server; exposed at `api.terra-indomita.ca` via Cloudflare Tunnel.
- Admin: `admin.terra-indomita.ca` protected by Cloudflare Zero Trust (Access).
- DNS/Edge: Cloudflare DNS + Pages + cache rules + custom outage page.

## Tech Stack
- Frontend: HTML/CSS/vanilla JS (no framework, minimal dependencies).
- CMS/API: Directus 11 (REST), SQLite (dev), pluggable to Postgres.
- Cloudflare: Pages, DNS, Tunnel, Access (Zero Trust), Cache Rules.

## Repository Layout
index.html
assets/
css/styles.css
images/
cms/ # Directus app (ignored: node_modules, db, uploads, .env)
docs/
PLAN.md # Work plan / milestones
frontend/calendar-requirements.md
cms/README.md # Runbook: model, roles, tasks
api/README.md # Public endpoints & examples
infra/cloudflare-behavior.md
initiation/*.md # Branding, domains, schema

## Content Model & API
- Event fields: `title`, `start`, `end?`, `location?`, `description?`, `featured_image?`.
- Global settings (singleton): `showCurrentEvents` (bool).
- Public read endpoints (Directus REST):
  - `GET /items/events?sort=start&fields=title,start,end,location,description,featured_image`
  - `GET /items/global_settings`
- Health: `GET /server/health`

## Frontend Notes
- Fetches both endpoints and groups events client-side.
- Preserves line breaks in descriptions.
- Featured images are shown at the top of the modal (no cropping; `object-fit: contain`).
- Calendar grid uses a large background indicator per day, with status colors.

## Cloudflare Behavior
- Pages: static site served from edge; custom domains for staging/prod.
- Cache rules: 60–120s TTL for `/items/events*` and `/items/global_settings*`; bypass admin and non-GET.
- Outage: custom error page for 520–527; frontend includes a soft-fail message for API hiccups.
- See `docs/infra/cloudflare-behavior.md`.

## Local Development
python3 -m http.server 3000

open http://localhost:3000

Directus lives in `cms/` (not required to preview the static site). See `docs/cms/README.md` for bootstrapping and `cms/.env.example`.

## Migration Plan (Summary)
1) Serve staging on `test.terra-indomita.ca`.  
2) Attach production domains to Pages and flip DNS to Cloudflare (short TTL).  
3) Verify, then merge `project-rebuild` → `main` and set Pages to build from `main`.  
4) Disable GitHub Pages. Rollback: revert DNS records (low TTL).

## Roadmap
- iCal/ICS export; Markdown rendering in descriptions.
- Prefetch adjacent months; filter by tags/locations.
- Admin workflows (service tokens) for future automations.

## License

- Code: MIT (see LICENSE)
- Documentation: CC BY 4.0 (see docs/LICENSE-docs)
- Fonts: Nunito under OFL 1.1 (see assets/fonts/nunito/OFL.txt if self-hosted)
- Images/Branding: © Terra Indomita, all rights reserved; not for redistribution (see assets/LICENSE-ASSETS)

## License

- Code: MIT (see LICENSE)
- Documentation: CC BY 4.0 (see docs/LICENSE-docs)
- Fonts: Nunito under OFL 1.1 (see assets/fonts/nunito/OFL.txt if self-hosted)
- Images/Branding: © Terra Indomita, all rights reserved; not for redistribution (see assets/LICENSE-ASSETS)

If you need a different license for a specific part of this repo, open an issue first.
