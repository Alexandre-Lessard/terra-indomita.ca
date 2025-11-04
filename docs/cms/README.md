# CMS Runbook (Directus)

- Admin UI: https://admin.terra-indomita.ca (behind Cloudflare Access)
- API base: https://api.terra-indomita.ca (tunnel -> Directus on port 8055)

## Content Model
  - Collection `events` (UUID PK)
    - Fields: title, start, end, location, description, featured_image
- Singleton `global_settings`
  - Field: showCurrentEvents (boolean, default true)

## Roles
- `client`: CRUD on `events`, read-only on `global_settings`
- `integrations`: CRUD on `events`, update `global_settings` (used by service token)
- `public`: read-only on `events` (selected fields) and `global_settings.showCurrentEvents`

## Common Tasks
- Add/edit event: Content → Events → Save.
- Toggle Current group: Content → Global Settings → switch “Show Current Events”.

## API Usage
- Frontend fetches:
  - GET /items/events?sort=start&fields=title,slug,start,end,location,description,featured_image
  - GET /items/global_settings
- Client-side groups events into Upcoming/Current/Past using documented rules.

## Operations
- Health: GET /server/health
- Backups: sqlite DB at `cms/database/data.db` (include in nightly backup)
- Updates: `npm install`, `npx directus update` (plan maintenance window)
