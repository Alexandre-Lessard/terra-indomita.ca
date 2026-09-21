# Workflow: dev → staging → production

Every change follows the same path, and the organizer validates on staging
before anything reaches the public site.

1. **Develop locally** against invented data.
2. **Push to `staging`.** CI runs, then the staging Worker is deployed.
3. **Review on staging** with the organizer (the URL is behind Access).
4. **Fast-forward `main` to `staging` and push.** CI runs, then production is deployed.

## Local development

Requirements: Node 24 LTS (pinned in `.tool-versions`) and npm 11.

```bash
npm ci
npm run build                          # export the site to frontend/out
npm run db:migrate:local -w worker     # create the local D1 schema
npm run db:seed:local -w worker        # load invented events
npm run dev                            # Worker + site on http://localhost:8787
```

For live-reloading UI work, run `npm run dev -w frontend` in a second terminal:
`next dev` serves on port 3000 and proxies `/api` to the Worker on 8787.

Locally, the admin is open (`AUTH_MODE=dev`), Turnstile uses Cloudflare's test
keys and emails are written to disk instead of being sent. **Real registrations
never go to a development machine or to staging**; the seed is invented.

Checks, the same as CI:

```bash
npm run lint && npm run typecheck && npm run build && npm test
```

## Branches and CI/CD

| Branch | On push | Protection |
|---|---|---|
| any other | `ci.yml`: lint, type-check, build, test | — |
| `staging` | `cd-staging.yml`: CI, D1 migrations, deploy to staging | no force-push, no deletion |
| `main` | `cd.yml`: CI, D1 migrations, deploy to production | no force-push, no deletion, CI must have passed on the commit |

Promoting to production is a fast-forward, so the commit already carries a
green CI run from staging:

```bash
git switch main && git merge --ff-only staging && git push
```

Deploy tokens are scoped per environment and stored as the repository secrets
`CLOUDFLARE_API_TOKEN_STAGING` and `CLOUDFLARE_API_TOKEN_PROD`; the account ID
is the repository variable `CLOUDFLARE_ACCOUNT_ID`.

## Database changes

Add a numbered SQL file to `worker/migrations/` and test it locally with
`npm run db:migrate:local -w worker`. CI applies pending migrations before each
deploy, so a migration must work with the code that is already live.

## Keeping dependencies current

Checked by hand before each production release (`npm outdated`, `npm audit`).

- Minor and patch versions: always take the latest.
- A new major version: adopt it once it has been stable for about three months
  and the ecosystem supports it.

Held back on 2026-09-21, and why:

| Package | Kept on | Reason |
|---|---|---|
| Node | 24 LTS | Node 26 becomes LTS in October 2026. |
| TypeScript | 6.0 | TypeScript 7 (native rewrite) was released in July 2026. |
| ESLint | 9 | `eslint-plugin-react`, used by `eslint-config-next`, does not support ESLint 10 yet. |
| Vitest | 4.1 | `@cloudflare/vitest-pool-workers` requires Vitest 4.1. |
| framer-motion | 12 | Version 13 was released in August 2026. |
| `@testing-library/jest-dom` | 6 | Version 7 was released in July 2026. |
| `actions/checkout`, `actions/setup-node` | v6 | v7 was released in July 2026. |
