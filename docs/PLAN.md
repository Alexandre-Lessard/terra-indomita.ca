# Project Plan — Events Landing Page (Cloudflare Pages + Self-Hosted API/CMS)

## 1) How I’m framing it

I’m building a fast public landing site with an events section that automatically organizes **upcoming / current / past** events. The CMS runs on **my own server** so my client can manage events through a GUI, while the static frontend is deployed to **Cloudflare Pages** for global speed and reliability. Everything (frontend, API spec, infra docs) lives in **one GitHub repository** to serve as a clean portfolio project.

---

## 2) What “done” means (my success criteria)

* The landing page is fast worldwide (served from Cloudflare Pages).
* Events correctly auto-categorize by time (with my option to **disable “Current”** state globally).
* My client can add/edit/delete events in the CMS (role-limited).
* If the backend is unreachable, visitors see a friendly **“come back later”** message on the events page; if the origin is down, Cloudflare serves a static **outage page**.
* Single-repo workflow with push-to-deploy for the frontend; clear runbooks for the backend.
* Smooth migration from the old GitHub-hosted page, with a **temporary subdomain** for testing before cutover.

---

## 3) Scope (what I’m delivering)

**In scope**

* Static landing site on Cloudflare Pages (branding, hero, nav).
* Events view with automatic grouping; optional suppression of “Current”.
* Self-hosted headless CMS on my server (GUI for client).
* Public read API for events; authenticated write operations.
* Cloudflare configuration (DNS, caching rules, outage page behavior).
* “Backend unreachable” fallback UX on the frontend.
* Staging on a temporary subdomain; final DNS cutover; redirects as needed.
* Docs/runbooks for operations and ongoing maintenance (since I’ll keep managing the site).

**Out of scope (for now)**

* Ticketing/payments, external calendar sync, multi-language, mobile apps.

---

## 4) Roles (kept minimal)

* **Me**: Product, PM, frontend, backend, DevOps, support, ongoing maintenance.
* **Client**: Enters/updates events in the CMS via a limited role.

> I’m omitting a formal “Stakeholders & Roles” section since I’m doing everything except the client’s content updates.

---

## 5) Architecture (how it all fits)

* **Frontend**: Static site on Cloudflare Pages (pulled from GitHub). Fetches events via HTTPS from my API domain.
* **Backend API**: Runs on my server; exposed safely through **Cloudflare Tunnel**. Read endpoints are public and cache-friendly; write endpoints require auth.
* **CMS**: Runs on my server next to the API; GUI login for the client with restricted permissions.
* **Database**: Single events collection/table (timestamps for start/end). CMS owns content; API provides a stable read shape.
* **Caching**: Cloudflare caches the static site; the events JSON is cached briefly (short TTL) to reduce origin load while keeping changes visible quickly.
* **Outage UX**:

  * If **API hiccups**: the events page shows a **soft fallback** (“come back later”) instead of a blank error.
  * If the **origin is down**: Cloudflare serves a static **outage page** explaining the site is temporarily unavailable.

---

## 6) Functional details (what I’ll implement)

* **Events logic**

  * Upcoming: `start > now`.
  * (Optional) Current: `start ≤ now ≤ end` (or `start == now` if no end).
  * Past: `end < now` (or `start < now` if no end).
  * **Toggle**: A **global CMS setting** (“Show Current Events”) that, when disabled, will skip the “Current” group entirely—events jump straight from upcoming to past once finished.
* **Admin**

  * Client role limited to events CRUD only.
  * Required fields: title, start; optional: end, location, description.
* **Fallbacks**

  * Frontend shows a **non-blocking message** if the events API doesn’t respond (no hard failure of the landing page).
  * Cloudflare serves a **static outage page** if the origin is unavailable.

---

## 7) Non-functional (quality targets)

* **Performance**: Static assets from edge; events API cached 60–120s (and respectful of auth).
* **Availability**: Pages highly available; backend on my server (99%+); friendly degraded modes.
* **Security**: No public ports; everything proxied via Cloudflare; TLS everywhere; admin endpoints authenticated; optional Zero-Trust gate for the CMS.
* **Maintainability**: Single repo, clear folders, env files, and runbooks.

---

## 8) Assumptions & constraints

* I control the domain in Cloudflare DNS.
* My server is stable, backed up, and monitored.
* Free Cloudflare tiers are sufficient for this use case.

---

## 9) Deliverables (what I’ll produce)

* **GitHub repo** with:

  * `/frontend` (Cloudflare Pages project root).
  * `/api` (service definition, env sample, health endpoint).
  * `/cms` (bootstrap/notes, role definition, content model).
  * `/infra` (Cloudflare Pages/Tunnel notes, caching, outage page instructions).
  * `README` with architecture, setup, deploy, and maintenance notes.
* **Cloudflare config**

  * DNS + custom domains for production and staging.
  * Cache rules (static site; short-TTL for GET /events).
  * Outage/static error page behavior documented.
* **Operations docs**

  * How I deploy, purge cache, rotate secrets.
  * How the client logs in and manages events.
  * Backup/restore notes.

---

## 10) Work breakdown (my steps)

1. **Initiation**

   * Confirm domain(s), branding, events field schema. [Done]
   * Define the global **“Show Current Events”** setting behavior. [Done]

   Status: Completed — domains, branding, events schema, and toggle documented.

2. **Infrastructure**

   * Set up Cloudflare Pages (connected to the GitHub repo). [Done]
   * Configure DNS for production and a **temporary staging subdomain** (e.g., `test.terra-indomita.ca`). [Done]
   * Create Cloudflare Tunnel routes for `api.terra-indomita.ca` and `admin.terra-indomita.ca`. [Done]

   Status: Completed

3. **CMS**

   * Install on my server; create `events` collection with the agreed fields.
   * Add a **Global Settings** collection (includes “Show Current Events”).
   * Create the limited client role and user; document the workflow.
      Database File Path: (/home/prod/terra-indomita.ca/cms/data.db)

4. **API**

   * Public read endpoint for events (normalized shape; cache-hint headers).
   * Authenticated write endpoints for admin ops (used by CMS or kept for future).
   * Health endpoint for monitoring.

5. **Frontend**

   * Build landing + events pages; apply simple, accessible brand styling.
   * Implement client-side grouping logic; respect the **“Show Current Events”** toggle.
   * Add **graceful fallback UI** if the API is unavailable.

6. **Cloudflare behavior**

   * Cache rules: static site cached; `/events` short TTL; bypass for admin/auth.
   * Configure **outage page** to show a clear “site down—please check back later” message if the origin is unreachable.

7. **Testing (on the temporary subdomain)**

   * Functional: CRUD in CMS, time-based transitions, toggle “Current”.
   * Resilience: simulate API downtime → frontend fallback; simulate origin down → outage page.
   * Performance: edge delivery for static; acceptable latency for events fetch.

8. **Migration**

   * Keep the old GitHub page live during staging.
   * Finalize content and approvals on the **temporary subdomain**.
   * Schedule DNS cutover window.
   * Cut over the root/primary domain to the new Cloudflare Pages project.
   * Validate, purge caches, set up redirects if any URLs changed.

9. **Post-launch**

   * Monitoring on the API health endpoint.
   * Monthly CMS and OS updates; periodic review of Cloudflare settings.
   * Ongoing client support (I continue to manage the website).

---

## 11) Milestones

* **M1**: Cloudflare Pages + DNS + Tunnel working (staging subdomain live).
* **M2**: CMS ready (events model + settings + client role).
* **M3**: API ready (read + cache hints + health).
* **M4**: Frontend ready (landing, events, fallback UX, toggle respected).
* **M5**: Staging tests passed (functional, resilience, performance).
* **M6**: Migration & go-live (DNS cutover, cache purge, verification).

---

## 12) Risks & how I’m handling them

* **Origin/API downtime** → Frontend fallback + Cloudflare outage page; health monitoring.
* **Client misuse in CMS** → Role-limited access; short TTL caching to recover quickly.
* **Cache staleness** → Short event TTL; documented manual purge procedure.
* **Migration hiccups** → Temporary subdomain for full UAT; staged DNS cutover; smoke tests post-switch.

---

## 13) Ongoing management (my commitment)

* I will keep administering hosting, CMS updates, Cloudflare settings, and client support after launch.
* I’ll maintain the repo, update docs as things evolve, and handle content or structural changes per the client’s needs.
