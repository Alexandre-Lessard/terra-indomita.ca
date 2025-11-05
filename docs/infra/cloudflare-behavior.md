# Cloudflare Behaviour

## Cache Rules
- Static assets (HTML/CSS/JS/images) served from Pages with the default “Cache Everything” rule.
- API `https://api.terra-indomita.ca/items/events*` cached with a 60 s TTL (respect origin headers) to keep the calendar fresh.
- API `https://api.terra-indomita.ca/items/global_settings*` cached with a 60 s TTL so the “Show Current Events” toggle updates quickly.
- `admin.terra-indomita.ca` and POST/PUT/PATCH/DELETE requests are set to “Bypass cache” so administrative traffic never gets cached.

## Zero-Trust / Tunnel
- `admin.terra-indomita.ca` protected by Cloudflare Access (email-based allow policy).
- `api.terra-indomita.ca` left open for the public calendar; tunnel routes both hostnames to Directus on port 8055.

## Outage & Origin Failures
- Cloudflare Custom Error Page: friendly static HTML stored in Pages (e.g., `/outage/index.html`) and mapped to 520–527.
- Cloudflare “Always Online” disabled; outage page handles origin downtime.
- Frontend calendar hides automatically and shows “Impossible de charger…” whenever the API fails, so visitors see a graceful fallback even if the origin is reachable but the API is down.

## Operational Notes
- Purge Pages cache after major static updates.
- Purge API cache (Rules → Cache → Purge by URL) when forced refresh of events is needed.
- Cloudflare Health Check hits `https://api.terra-indomita.ca/server/health` every 60 s; alert configured for 3 consecutive failures.