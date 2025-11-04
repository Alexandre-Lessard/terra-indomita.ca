# API Notes

## Public Endpoints (Directus REST)

### List events
GET https://api.terra-indomita.ca/items/events

- Recommended query params: `?sort=start&fields=title,start,end,location,description,featured_image`
  - Use the response to group events client-side (Upcoming/Current/Past).
- Cache with Cloudflare: set a rule for `/items/events*` to respect `max-age=60`.

### Global toggle
GET https://api.terra-indomita.ca/items/global_settings

- Contains the singleton record with `showCurrentEvents`.
- Cache similarly (short TTL) so frontend sees changes quickly.

## Authenticated Writes (Admin Ops)

- Role: `integrations`
- Token: static token generated in Directus (store in secrets manager).
- Example:
  ```bash
  curl -X POST "https://api.terra-indomita.ca/items/events" \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Stage de formation",
      "start": "2025-03-21T09:00:00-04:00",
      "location": "Estrie, QC"
    }'
