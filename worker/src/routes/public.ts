import { Hono } from "hono";
import { createRegistration, getEvent, getShowCurrentEvents, listEvents, type EventRecord } from "../db";
import { isRegistrationOpen, nowLocal } from "../lib/dates";
import { sendRegistrationNotice } from "../lib/notify";
import { turnstileSecret, verifyTurnstile } from "../lib/turnstile";
import { registrationSchema } from "../schemas";

export function imageUrl(key: string | null): string | null {
  return key ? `/api/images/${key}` : null;
}

export function toPublicEvent(event: EventRecord) {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    location: event.location,
    description: event.description,
    image: imageUrl(event.imageKey),
  };
}

export const publicRoutes = new Hono<{ Bindings: Env }>();

publicRoutes.get("/events", async (c) => {
  const events = await listEvents(c.env.DB);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ data: events.map(toPublicEvent) });
});

publicRoutes.get("/settings", async (c) => {
  const showCurrentEvents = await getShowCurrentEvents(c.env.DB);
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ data: { showCurrentEvents } });
});

publicRoutes.get("/images/:key", async (c) => {
  const object = await c.env.IMAGES.get(c.req.param("key"));
  if (!object) return c.notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  // Keys are random and never reused, so an image never changes under a URL.
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

publicRoutes.post("/registrations", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const { success: withinLimit } = await c.env.REGISTRATION_LIMITER.limit({ key: ip });
  if (!withinLimit) {
    return c.json({ error: "Trop de tentatives. Réessayez dans une minute." }, 429);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Formulaire invalide.", issues: parsed.error.issues }, 400);
  }
  const input = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend it worked, store nothing.
  if (input.website) return c.json({ ok: true }, 201);

  const human = await verifyTurnstile(turnstileSecret(c.env), input.turnstileToken, ip);
  if (!human) {
    return c.json({ error: "La vérification anti-robot a échoué. Réessayez." }, 403);
  }

  const event = await getEvent(c.env.DB, input.event);
  if (!event) return c.json({ error: "Événement introuvable." }, 404);
  if (!isRegistrationOpen(event, nowLocal())) {
    return c.json({ error: "Les inscriptions à cet événement sont fermées." }, 409);
  }

  await createRegistration(c.env.DB, {
    eventId: event.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    consentAt: new Date().toISOString(),
  });

  // The registration is stored even if the notice fails; the admin lists it.
  c.executionCtx.waitUntil(
    sendRegistrationNotice(c.env, {
      eventTitle: event.title,
      eventStart: event.start,
      name: input.name,
      email: input.email,
      phone: input.phone,
    }).catch((err: unknown) => {
      console.error("registration notice failed", err instanceof Error ? err.message : err);
    }),
  );

  return c.json({ ok: true }, 201);
});
