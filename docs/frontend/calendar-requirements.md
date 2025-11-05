# Calendar Events Experience

## Overview
- Default view shows the current month in a month grid.
- Today is visually highlighted to aid orientation.
- Days containing one or more events display a colored indicator.
- Clicking an event day opens an overlay (modal) with the list of events for that date.
- Modal shows event title, time range, location (if any), and description with preserved line breaks.

## Navigation & Interaction
- Provide previous/next month arrows; keyboard-focusable buttons.
- Include aria-live updates for the month/year so screen readers announce changes.
- Ensure ESC closes the overlay; clicking outside the modal closes it as well.
- Support multiple events per day; list them in chronological order inside the overlay.

## Data & Logic
- Pull data from `GET /items/events?sort=start&fields=title,start,end,location,description,featured_image`.
- Reuse the `showCurrentEvents` toggle to optionally highlight ongoing events in the current day.
- Cache fetched data client-side; only refetch on explicit refresh to limit API calls.

## Styling Notes
- Calendar inherits the existing color palette; use accent color for days with events.
- Overlay should cover the viewport with a semi-transparent background and be responsive.
- Ensure text contrast meets WCAG AA.

## Fallback Behaviour
- If the API fails, show the existing friendly message and hide the calendar grid.
- When no events exist for the selected month, display a muted empty-state message in the overlay.

## Implementation Notes
- Loading state shows a shimmering placeholder grid before event data renders.
- Day indicators now fill most of the cell to make busy dates obvious (upcoming/current/past color coding).
- Event modal grows up to 720px wide, scrolls when content is tall, and displays the featured image at the top using `object-fit: contain` so nothing is cropped or stretched.
