# Architecture

Everything runs on Cloudflare, inside the Workers Paid plan: one Worker serves
the site and its API, D1 stores the data, R2 stores event images.

```
                      ┌──────────────────────── Cloudflare ────────────────────────┐
 visitor ──HTTPS──▶   │  Worker  terra-indomita                                    │
                      │   ├─ static assets   Next.js static export (frontend/out)  │
                      │   ├─ /api/*          Hono API ──▶ D1   events, settings,   │
                      │   │                              │      registrations      │
                      │   │                              └──▶ R2   event images    │
                      │   ├─ /api/registrations ──▶ Turnstile siteverify           │
                      │   │                     └──▶ Email Routing ──▶ organizer   │
                      │   └─ cron (daily)    purge registrations older than 6 mo.  │
 organizer ──▶ Access ──▶ /admin, /api/admin/* (JWT re-checked by the Worker)      │
                      └────────────────────────────────────────────────────────────┘
```

## Components

| Part | Where | Notes |
|---|---|---|
| Site | `frontend/` | Next.js 16 static export, Tailwind 4, shadcn/ui, framer-motion. One page plus `/confidentialite/` and the admin. |
| API | `worker/src/routes/` | Hono on Workers. Public routes are cached 60 s at the browser; admin routes are `no-store`. |
| Data | D1 (`worker/migrations/`) | `events`, `settings` (single row), `registrations`. Plain SQL migrations, applied by CI. |
| Images | R2 | Keys are random (`<uuid>.<ext>`), served with a one-year immutable cache. |
| Admin auth | Cloudflare Access | Email one-time code. The Worker verifies the `Cf-Access-Jwt-Assertion` JWT against the application's audience, so a request that bypasses Access is still refused. |
| Anti-spam | Turnstile + honeypot + rate limiter | 5 registration attempts per minute per IP (Workers rate limiting binding). |
| Notifications | Email Routing `send_email` binding | Sent to a verified destination address only, which is free. The notice's `Reply-To` is the participant. |
| Retention | Cron trigger | Deletes registrations six months after their event ends (see the privacy policy). Optional `HEARTBEAT_URL` secret pings an external monitor after each run. |

## Dates

Event dates are **naive local times** in `America/Toronto` (`2026-08-15T09:00:00`),
the format the previous CMS served. They are compared as strings against the
current Montreal wall-clock time (`worker/src/lib/dates.ts`) and parsed as
local time by the browser. Timestamps such as `created_at` are UTC ISO strings.

## Environments

| | URL | D1 | R2 | Access |
|---|---|---|---|---|
| Development | `http://localhost:8787` | local (`terra-indomita-dev`) | local | none (`AUTH_MODE=dev`) |
| Staging | `https://terra-indomita-staging.alexandre-lessard92.workers.dev` | `terra-indomita-staging` | `terra-indomita-images-staging` | whole host, `noindex` |
| Production | `https://terra-indomita.ca` | `terra-indomita-prod` | `terra-indomita-images-prod` | `/admin` and `/api/admin` |

Staging is a separate Worker with its own database rather than a preview
version of production: preview versions share their Worker's bindings, so a
production preview would write to the production database.

Secrets (`TURNSTILE_SECRET_KEY`, optional `HEARTBEAT_URL`) are set per Worker
with `wrangler secret put`; nothing secret is committed. Local development uses
Cloudflare's always-pass Turnstile test keys.

## Cost

Workers, D1, the rate limiter and cron triggers are covered by Workers Paid.
R2 stays within its free tier (a few images). Access (under 50 users),
Turnstile, Email Routing to verified addresses and GitHub Actions on a public
repository are free.
