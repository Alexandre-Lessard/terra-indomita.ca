-- Event dates are naive local times (America/Toronto), e.g. 2026-08-15T09:00:00,
-- the same format the previous CMS served. Timestamps are UTC ISO strings.

CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  start_at    TEXT NOT NULL,
  end_at      TEXT,
  location    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_key   TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX events_start_at ON events (start_at);

-- Single-row table holding site-wide switches.
CREATE TABLE settings (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  show_current_events INTEGER NOT NULL DEFAULT 1
);

INSERT INTO settings (id, show_current_events) VALUES (1, 1);

CREATE TABLE registrations (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX registrations_event_id ON registrations (event_id);
