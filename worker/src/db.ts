export interface EventRecord {
  id: string;
  title: string;
  start: string;
  end: string | null;
  location: string;
  description: string;
  imageKey: string | null;
}

export interface EventInput {
  title: string;
  start: string;
  end: string | null;
  location: string;
  description: string;
  imageKey: string | null;
}

export interface RegistrationRecord {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  consentAt: string;
  createdAt: string;
}

interface EventRow {
  id: string;
  title: string;
  start_at: string;
  end_at: string | null;
  location: string;
  description: string;
  image_key: string | null;
}

interface RegistrationRow {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  consent_at: string;
  created_at: string;
}

const EVENT_COLUMNS = "id, title, start_at, end_at, location, description, image_key";

function toEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    start: row.start_at,
    end: row.end_at,
    location: row.location,
    description: row.description,
    imageKey: row.image_key,
  };
}

function toRegistration(row: RegistrationRow): RegistrationRecord {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    consentAt: row.consent_at,
    createdAt: row.created_at,
  };
}

export async function listEvents(db: D1Database): Promise<EventRecord[]> {
  const { results } = await db
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events ORDER BY start_at`)
    .all<EventRow>();
  return results.map(toEvent);
}

export async function listEventsWithCounts(
  db: D1Database,
): Promise<(EventRecord & { registrationCount: number })[]> {
  const { results } = await db
    .prepare(
      `SELECT ${EVENT_COLUMNS},
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = events.id) AS registration_count
         FROM events ORDER BY start_at DESC`,
    )
    .all<EventRow & { registration_count: number }>();
  return results.map((row) => ({ ...toEvent(row), registrationCount: row.registration_count }));
}

export async function getEvent(db: D1Database, id: string): Promise<EventRecord | null> {
  const row = await db
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`)
    .bind(id)
    .first<EventRow>();
  return row ? toEvent(row) : null;
}

export async function createEvent(db: D1Database, input: EventInput): Promise<EventRecord> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO events (id, title, start_at, end_at, location, description, image_key)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.title, input.start, input.end, input.location, input.description, input.imageKey)
    .run();
  return { id, ...input };
}

export async function updateEvent(db: D1Database, id: string, input: EventInput): Promise<void> {
  await db
    .prepare(
      `UPDATE events
          SET title = ?, start_at = ?, end_at = ?, location = ?, description = ?, image_key = ?,
              updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
        WHERE id = ?`,
    )
    .bind(input.title, input.start, input.end, input.location, input.description, input.imageKey, id)
    .run();
}

export async function deleteEvent(db: D1Database, id: string): Promise<void> {
  await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
}

export async function getShowCurrentEvents(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare("SELECT show_current_events FROM settings WHERE id = 1")
    .first<{ show_current_events: number }>();
  return row ? row.show_current_events === 1 : true;
}

export async function setShowCurrentEvents(db: D1Database, value: boolean): Promise<void> {
  await db
    .prepare(
      `INSERT INTO settings (id, show_current_events) VALUES (1, ?)
       ON CONFLICT (id) DO UPDATE SET show_current_events = excluded.show_current_events`,
    )
    .bind(value ? 1 : 0)
    .run();
}

export async function createRegistration(
  db: D1Database,
  input: Omit<RegistrationRecord, "id" | "createdAt">,
): Promise<RegistrationRecord> {
  const record: RegistrationRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  await db
    .prepare(
      `INSERT INTO registrations (id, event_id, name, email, phone, consent_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(record.id, record.eventId, record.name, record.email, record.phone, record.consentAt, record.createdAt)
    .run();
  return record;
}

export async function listRegistrations(db: D1Database, eventId: string): Promise<RegistrationRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT id, event_id, name, email, phone, consent_at, created_at
         FROM registrations WHERE event_id = ? ORDER BY created_at`,
    )
    .bind(eventId)
    .all<RegistrationRow>();
  return results.map(toRegistration);
}

export async function deleteRegistration(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM registrations WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}

/** Deletes registrations for events that ended before `cutoff` (naive local time). */
export async function purgeRegistrationsBefore(db: D1Database, cutoff: string): Promise<number> {
  const result = await db
    .prepare(
      `DELETE FROM registrations
        WHERE event_id IN (SELECT id FROM events WHERE COALESCE(end_at, start_at) < ?)`,
    )
    .bind(cutoff)
    .run();
  return result.meta.changes;
}
