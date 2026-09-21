# Production cutover

One-time runbook to move `terra-indomita.ca` from the legacy setup (static
page on Cloudflare Pages + Directus on a home server) to the Worker. Once done,
production releases follow [the normal workflow](workflow.md).

State prepared before cutover (2026-09-21):

- Worker `terra-indomita` exists but serves nothing publicly (`workers_dev` off, no route).
- D1 `terra-indomita-prod` is empty and migrated by the first production deploy.
- R2 bucket `terra-indomita-images-prod`, Turnstile widget `terra-indomita-prod`
  (secret already set on the Worker) and the Access application
  "Terra Indomita site admin" (`terra-indomita.ca/admin`, `/api/admin`) exist.
- Automatic deployments of the Pages project `terra-indomita-ca` are paused.
- Legacy Directus `/admin` and `/auth` on `api.terra-indomita.ca` are behind Access.

## 1. Before

- [ ] Staging validated by the organizer.
- [ ] Dependencies checked (`npm outdated`, `npm audit`) and any update released to staging first.
- [ ] GitHub Pages disabled on the repository (still configured on `main` with the
      `terra-indomita.ca` CNAME): `gh api -X DELETE repos/Alexandre-Lessard/terra-indomita.ca/pages`.
- [ ] The organizer has stopped editing events in Directus.

## 2. Release the code

1. Add the custom domains to `env.production` in `worker/wrangler.jsonc`, on `staging`:

   ```jsonc
   "routes": [
     { "pattern": "terra-indomita.ca", "custom_domain": true },
     { "pattern": "www.terra-indomita.ca", "custom_domain": true }
   ],
   ```

   The Worker redirects `www` to the apex. Push to `staging`, let CI pass.
2. Detach the domains from Pages, so the Worker can take them. In the dashboard,
   open Workers & Pages › `terra-indomita-ca` › Custom domains, and remove
   `terra-indomita.ca`, `www.terra-indomita.ca` and `test.terra-indomita.ca`.
   Then delete **only** these DNS records:

   | Delete | Keep |
   |---|---|
   | `CNAME terra-indomita.ca → terra-indomita-ca.pages.dev` | the three `MX` records (Email Routing) |
   | `CNAME www → terra-indomita-ca.pages.dev` | `TXT` SPF and the `cf2024-1._domainkey` DKIM |
   | `CNAME test → terra-indomita-ca.pages.dev` | `TXT facebook-domain-verification` (Meta) |
   | | `TXT google-site-verification` (Search Console) |

   The site is down from here until step 3 finishes (about a minute).
3. Promote: `git switch main && git merge --ff-only staging && git push`.
   `cd.yml` migrates D1, deploys and creates the domain records.
4. Import the legacy events: `node ops/import-directus.mjs --env production`.

## 3. Verify

- [ ] `https://terra-indomita.ca` shows the new site; `https://www.terra-indomita.ca` redirects to it.
- [ ] The imported events appear in the calendar.
- [ ] `/admin` asks for the Access code; the organizer can sign in.
- [ ] A test registration by Lessard on an upcoming event reaches the organizer's
      inbox; delete it afterwards from the admin.
- [ ] `/robots.txt` allows crawling and lists the sitemap; there is no `X-Robots-Tag`.
- [ ] `dig TXT terra-indomita.ca` still returns the Meta and Google verifications.
- Never open real registrations from a development machine: check counts, not contents.

**Rollback:** remove the custom domains from the Worker, re-add the three
hostnames to the Pages project (it recreates the CNAME records) and re-enable
its deployments. Events created in the new admin in the meantime are not in Directus.

## 4. After

- [ ] Submit `https://terra-indomita.ca/sitemap.xml` in Search Console; check the Google Business Profile.
- [ ] External monitoring: an HTTP monitor on `https://terra-indomita.ca`, and a
      heartbeat monitor whose URL is set with
      `npx wrangler secret put HEARTBEAT_URL --env production` (in `worker/`).

## 5. One week later: decommission

- [ ] Stop Directus on LocalProdServer (`sudo systemctl disable --now directus`).
      Its working copy is a clone of this repository whose `cms/data.db` is the
      live database: never `git pull` in it (the history has been rewritten).
- [ ] Remove `api.terra-indomita.ca` and `admin.terra-indomita.ca` from the tunnel,
      then their DNS records.
- [ ] Delete the Access application "Terra Indomita Admin" and the cache rules for `/items/*`.
- [ ] Delete the Cloudflare Health Check on `api.terra-indomita.ca/server/health`.
- [ ] Delete the Pages project `terra-indomita-ca`.
- [ ] Remove the keyring entry `service terra-indomita key directus-admin`.
