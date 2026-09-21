# Terra Indomita

Website of Terra Indomita, an outdoor school in Franklin, Québec: a one-page
site with an events calendar, online registration and a small admin for the
organizer. Everything runs on a single Cloudflare Worker.

- Production: https://terra-indomita.ca
- Staging: behind Cloudflare Access (see [workflow](docs/workflow.md))

## Highlights

- **One Worker, no server.** The Worker serves the static Next.js export and a
  Hono API; D1 stores events and registrations, R2 stores images.
- **Admin without passwords.** `/admin` sits behind Cloudflare Access (email
  one-time code) and the Worker re-verifies the Access JWT on every call.
- **Registrations that respect privacy.** Turnstile, a honeypot and per-IP rate
  limiting stop bots; consent is recorded; a nightly cron deletes registrations
  six months after their event, as the privacy policy (Quebec's Law 25) states.
- **Dev → staging → production.** Invented seed data locally, a separate staging
  Worker and database, and GitHub Actions that test, migrate and deploy.
- **Tested in the Workers runtime.** API tests run against real D1, R2 and
  rate-limiter bindings with `@cloudflare/vitest-pool-workers`.

## Stack

| Layer | Tools |
|---|---|
| Site | Next.js 16 (static export), React 19, TypeScript 6, Tailwind CSS 4, shadcn/ui, framer-motion |
| API | Cloudflare Workers, Hono, zod, jose |
| Data | Cloudflare D1 (SQLite), R2 |
| Security | Cloudflare Access, Turnstile, Workers rate limiting |
| Email | Cloudflare Email Routing (`send_email` binding) |
| Quality | Vitest, Testing Library, ESLint, GitHub Actions |

## Repository layout

```
frontend/   Next.js site and admin (static export to frontend/out)
worker/     Worker: API, migrations, seed, tests, wrangler.jsonc
ops/        One-off scripts (legacy CMS import)
docs/       Architecture, workflow, API, cutover runbook, admin guide
.github/    CI and deploy workflows
```

## Getting started

Requires Node 24 LTS (`.tool-versions`).

```bash
npm ci
npm run build
npm run db:migrate:local -w worker
npm run db:seed:local -w worker
npm run dev            # http://localhost:8787, admin at /admin/
```

Checks: `npm run lint && npm run typecheck && npm test`.

## Documentation

- [Architecture](docs/architecture.md): components, environments, dates, cost
- [Workflow](docs/workflow.md): local development, branches, CI/CD, dependency policy
- [API](docs/api.md): public and admin endpoints
- [Production cutover](docs/production-cutover.md): one-time move from the legacy setup
- [Guide de l'administration](docs/guide-admin.md): for the organizer, in French
- [Branding](docs/branding.md): colours, typography, image rights

## License

- Code: MIT (see [LICENSE](LICENSE))
- Documentation: CC BY 4.0 (see [docs/LICENSE-docs](docs/LICENSE-docs))
- Images and branding: © Terra Indomita, all rights reserved (see [docs/branding.md](docs/branding.md))
