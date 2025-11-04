# Global Settings Specification

setting: showCurrentEvents
label: Show "Current" Event Group
type: boolean
default: true
description: Controls whether events that have started but not finished appear in their own "Current" section on the frontend.

behaviour:
  when_true:
    - Events with start <= now <= end (or start == now when end missing) render under a "Current" heading.
    - Frontend groups into Upcoming, Current, Past.
  when_false:
    - Events transition straight from Upcoming to Past once start time passes.
    - Frontend hides the "Current" heading entirely.
    - API still returns raw timestamps; grouping logic stays client-side.

cms_ui:
  location: Global Settings collection
  permissions: Admin only
  audit: track toggles with timestamp + user

frontend_handling:
  fetch: GET /events includes `showCurrentEvents` boolean in payload metadata
  fallback: if toggle missing, assume default true (feature flag safe)

testing_notes:
  - Verify toggle on/off reflects within 120s (Cloudflare cache TTL) on staging
  - Document manual override steps in runbook
