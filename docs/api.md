# API

Same origin as the site. JSON responses wrap their payload in `data`; errors
are `{ "error": "<message in French>" }`.

## Public

| Method | Path | Notes |
|---|---|---|
| GET | `/api/events` | All events, sorted by start. `Cache-Control: max-age=60`. |
| GET | `/api/settings` | `{ showCurrentEvents }`. |
| GET | `/api/images/:key` | Event image from R2, cached for a year. |
| POST | `/api/registrations` | Registration for an event that has not ended. |

Event shape:

```json
{
  "id": "…",
  "title": "Stage d'autonomie en plein air",
  "start": "2026-08-15T09:00:00",
  "end": "2026-08-15T17:00:00",
  "location": "Franklin, QC",
  "description": "Line breaks are preserved.",
  "image": "/api/images/<uuid>.jpg"
}
```

`end`, `image` may be `null`. Dates are naive local times (see
[architecture](architecture.md#dates)).

Registration body:

```json
{
  "event": "<event id>",
  "name": "…",
  "email": "…",
  "phone": "optional",
  "consent": true,
  "turnstileToken": "…",
  "website": ""
}
```

| Status | Meaning |
|---|---|
| 201 | Stored; the organizer is notified. Also returned, without storing, when the honeypot `website` is filled. |
| 400 | Invalid body (missing consent, bad email, control characters…). |
| 403 | Turnstile verification failed. |
| 404 | Unknown event. |
| 409 | The event is over (its end, or its start when it has no end, has passed). |
| 429 | More than 5 attempts in a minute from the same IP. |

## Admin

All under `/api/admin`, behind Cloudflare Access; the Worker re-verifies the
Access JWT and answers 403 otherwise. Responses are `no-store`.

| Method | Path |
|---|---|
| GET | `/me` |
| GET, POST | `/events` |
| GET, PUT, DELETE | `/events/:id` (DELETE also removes the image and the registrations) |
| POST | `/images` (multipart `file`: JPEG, PNG or WebP, 8 MB max) |
| GET, PUT | `/settings` |
| GET | `/events/:id/registrations` |
| GET | `/events/:id/registrations.csv` (UTF-8 with BOM, `;` separated, for Excel) |
| DELETE | `/registrations/:id` |
