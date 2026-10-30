import { Hono } from "hono";
import {
  createEvent,
  deleteEvent,
  deleteRegistration,
  getEvent,
  getQrTarget,
  getShowCurrentEvents,
  listEventsWithCounts,
  listRegistrations,
  setQrTarget,
  setShowCurrentEvents,
  updateEvent,
} from "../db";
import { verifyAccess, type AccessIdentity } from "../lib/access";
import { nowLocal } from "../lib/dates";
import { eventSchema, settingsSchema } from "../schemas";
import { imageUrl, toPublicEvent } from "./public";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type AdminEnv = { Bindings: Env; Variables: { identity: AccessIdentity } };

export const adminRoutes = new Hono<AdminEnv>();

adminRoutes.use("*", async (c, next) => {
  const identity = await verifyAccess(c.req.raw, c.env);
  if (!identity) return c.json({ error: "Accès refusé." }, 403);
  c.set("identity", identity);
  c.header("Cache-Control", "no-store");
  await next();
});

adminRoutes.get("/me", (c) => c.json({ data: c.get("identity") }));

adminRoutes.get("/events", async (c) => {
  const events = await listEventsWithCounts(c.env.DB);
  return c.json({
    data: events.map((e) => ({ ...toPublicEvent(e), imageKey: e.imageKey, registrationCount: e.registrationCount })),
  });
});

adminRoutes.get("/events/:id", async (c) => {
  const event = await getEvent(c.env.DB, c.req.param("id"));
  if (!event) return c.json({ error: "Événement introuvable." }, 404);
  return c.json({ data: { ...toPublicEvent(event), imageKey: event.imageKey } });
});

adminRoutes.post("/events", async (c) => {
  const parsed = eventSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Formulaire invalide.", issues: parsed.error.issues }, 400);
  const event = await createEvent(c.env.DB, parsed.data);
  return c.json({ data: { ...toPublicEvent(event), imageKey: event.imageKey } }, 201);
});

adminRoutes.put("/events/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await getEvent(c.env.DB, id);
  if (!existing) return c.json({ error: "Événement introuvable." }, 404);
  const parsed = eventSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Formulaire invalide.", issues: parsed.error.issues }, 400);

  await updateEvent(c.env.DB, id, parsed.data);
  if (existing.imageKey && existing.imageKey !== parsed.data.imageKey) {
    await c.env.IMAGES.delete(existing.imageKey);
  }
  return c.json({ data: { ...toPublicEvent({ id, ...parsed.data }), imageKey: parsed.data.imageKey } });
});

adminRoutes.delete("/events/:id", async (c) => {
  const event = await getEvent(c.env.DB, c.req.param("id"));
  if (!event) return c.json({ error: "Événement introuvable." }, 404);
  await deleteEvent(c.env.DB, event.id);
  if (event.imageKey) await c.env.IMAGES.delete(event.imageKey);
  return c.body(null, 204);
});

adminRoutes.post("/images", async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return c.json({ error: "Aucun fichier reçu." }, 400);
  const extension = IMAGE_TYPES[file.type];
  if (!extension) return c.json({ error: "Format accepté : JPEG, PNG ou WebP." }, 415);
  if (file.size > MAX_IMAGE_BYTES) return c.json({ error: "Image trop lourde (8 Mo au maximum)." }, 413);

  const key = `${crypto.randomUUID()}.${extension}`;
  await c.env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return c.json({ data: { key, url: imageUrl(key) } }, 201);
});

async function readSettings(db: D1Database) {
  return { showCurrentEvents: await getShowCurrentEvents(db), qrTarget: await getQrTarget(db) };
}

adminRoutes.get("/settings", async (c) => {
  return c.json({ data: await readSettings(c.env.DB) });
});

adminRoutes.put("/settings", async (c) => {
  const parsed = settingsSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Réglage invalide." }, 400);
  if (parsed.data.showCurrentEvents !== undefined) await setShowCurrentEvents(c.env.DB, parsed.data.showCurrentEvents);
  if (parsed.data.qrTarget !== undefined) await setQrTarget(c.env.DB, parsed.data.qrTarget);
  return c.json({ data: await readSettings(c.env.DB) });
});

adminRoutes.get("/events/:id/registrations", async (c) => {
  const event = await getEvent(c.env.DB, c.req.param("id"));
  if (!event) return c.json({ error: "Événement introuvable." }, 404);
  return c.json({ data: await listRegistrations(c.env.DB, event.id) });
});

adminRoutes.get("/events/:id/registrations.csv", async (c) => {
  const event = await getEvent(c.env.DB, c.req.param("id"));
  if (!event) return c.json({ error: "Événement introuvable." }, 404);
  const rows = await listRegistrations(c.env.DB, event.id);
  const lines = [
    ["Nom", "Courriel", "Téléphone", "Inscrit le"],
    ...rows.map((r) => [r.name, r.email, r.phone, nowLocal(new Date(r.createdAt)).replace("T", " ").slice(0, 16)]),
  ].map((cells) => cells.map(csvCell).join(";"));
  // BOM + semicolons: what Excel expects in a French-Canadian locale.
  const csv = `\uFEFF${lines.join("\r\n")}\r\n`;
  const filename = `inscriptions-${event.start.slice(0, 10)}.csv`;
  return c.body(csv, 200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
});

adminRoutes.delete("/registrations/:id", async (c) => {
  const deleted = await deleteRegistration(c.env.DB, c.req.param("id"));
  return deleted ? c.body(null, 204) : c.json({ error: "Inscription introuvable." }, 404);
});

function csvCell(value: string): string {
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
