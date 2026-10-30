import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";
import { purgeExpiredRegistrations } from "../src/lib/retention";
import { addMonths, nowLocal } from "../src/lib/dates";

let ipCounter = 0;

async function call(path: string, init: RequestInit = {}, overrides: Partial<Env> = {}) {
  const request = new Request(`https://example.test${path}`, {
    ...init,
    headers: { "CF-Connecting-IP": `203.0.113.${++ipCounter % 250}`, ...init.headers },
  }) as Request<unknown, IncomingRequestCfProperties>;
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, { ...env, ...overrides } as Env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

function postJson(path: string, body: unknown, overrides: Partial<Env> = {}) {
  return call(
    path,
    { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } },
    overrides,
  );
}

async function insertEvent(start: string, end: string | null = null, title = "Stage d'essai") {
  const response = await postJson("/api/admin/events", { title, start, end, location: "Franklin" });
  expect(response.status).toBe(201);
  const { data } = (await response.json()) as { data: { id: string } };
  return data.id;
}

function mockTurnstile(success: boolean) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith("https://challenges.cloudflare.com/")) {
      return Response.json({ success });
    }
    throw new Error(`Unexpected fetch to ${url}`);
  });
}

const futureStart = addMonths(nowLocal(), 1);

function registration(eventId: string, extra: Record<string, unknown> = {}) {
  return {
    event: eventId,
    name: "Participante Fictive",
    email: "participante@example.com",
    phone: "450 555-0100",
    consent: true,
    turnstileToken: "token-de-test",
    ...extra,
  };
}

async function countRegistrations() {
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM registrations").first<{ n: number }>();
  return row?.n ?? 0;
}

beforeEach(async () => {
  await env.DB.exec("DELETE FROM registrations; DELETE FROM events;");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("public events API", () => {
  it("serves events sorted by start, in the shape the calendar expects", async () => {
    await insertEvent("2026-11-20T09:00", "2026-11-20T17:00", "Deuxième");
    await insertEvent("2026-10-10T09:00", null, "Premier");

    const response = await call("/api/events");
    expect(response.status).toBe(200);
    const { data } = (await response.json()) as { data: Record<string, unknown>[] };
    expect(data.map((e) => e.title)).toEqual(["Premier", "Deuxième"]);
    expect(data[0]).toMatchObject({ start: "2026-10-10T09:00:00", end: null, location: "Franklin", image: null });
  });

  it("serves the current-events setting", async () => {
    const response = await call("/api/settings");
    expect(await response.json()).toEqual({ data: { showCurrentEvents: true } });
  });
});

describe("registrations", () => {
  it("stores a valid registration once Turnstile passes", async () => {
    mockTurnstile(true);
    const eventId = await insertEvent(futureStart);
    const response = await postJson("/api/registrations", registration(eventId));
    expect(response.status).toBe(201);
    expect(await countRegistrations()).toBe(1);
  });

  it("silently drops honeypot submissions", async () => {
    const fetchSpy = mockTurnstile(true);
    const eventId = await insertEvent(futureStart);
    const response = await postJson("/api/registrations", registration(eventId, { website: "https://spam.test" }));
    expect(response.status).toBe(201);
    expect(await countRegistrations()).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses a failed Turnstile check", async () => {
    mockTurnstile(false);
    const eventId = await insertEvent(futureStart);
    const response = await postJson("/api/registrations", registration(eventId));
    expect(response.status).toBe(403);
    expect(await countRegistrations()).toBe(0);
  });

  it("refuses events that are already over", async () => {
    mockTurnstile(true);
    const eventId = await insertEvent("2025-06-01T09:00", "2025-06-01T17:00");
    const response = await postJson("/api/registrations", registration(eventId));
    expect(response.status).toBe(409);
  });

  it("requires consent and a valid email", async () => {
    mockTurnstile(true);
    const eventId = await insertEvent(futureStart);
    expect((await postJson("/api/registrations", registration(eventId, { consent: false }))).status).toBe(400);
    expect((await postJson("/api/registrations", registration(eventId, { email: "pas-un-courriel" }))).status).toBe(400);
    expect((await postJson("/api/registrations", registration(eventId, { name: "Nom\r\nBcc: x@y.z" }))).status).toBe(400);
  });

  it("rate-limits a single address", async () => {
    mockTurnstile(true);
    const eventId = await insertEvent(futureStart);
    const send = () =>
      call("/api/registrations", {
        method: "POST",
        body: JSON.stringify(registration(eventId)),
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.7" },
      });
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await send()).status);
    expect(statuses).toContain(429);
  });
});

describe("admin access", () => {
  const locked = { AUTH_MODE: "access" } as Partial<Env>;

  it("refuses the admin API without an Access token", async () => {
    expect((await call("/api/admin/events", {}, locked)).status).toBe(403);
    expect((await call("/api/admin/me", { headers: { "Cf-Access-Jwt-Assertion": "forged" } }, locked)).status).toBe(
      403,
    );
  });

  it("refuses the admin pages without an Access token", async () => {
    expect((await call("/admin/", {}, locked)).status).toBe(403);
  });

  it("exports registrations as a spreadsheet-safe CSV", async () => {
    mockTurnstile(true);
    const eventId = await insertEvent(futureStart);
    await postJson("/api/registrations", registration(eventId, { name: "=HYPERLINK(1)" }));

    const response = await call(`/api/admin/events/${eventId}/registrations.csv`);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const csv = new TextDecoder().decode(bytes);
    expect(csv).toContain(`"'=HYPERLINK(1)";"participante@example.com"`);
  });

  it("rejects an event whose end precedes its start", async () => {
    const response = await postJson("/api/admin/events", {
      title: "À l'envers",
      start: "2026-10-10T17:00",
      end: "2026-10-10T09:00",
    });
    expect(response.status).toBe(400);
  });
});

describe("retention", () => {
  it("purges registrations twelve months after their event, not before", async () => {
    const now = "2026-09-21T12:00:00";
    const old = await insertEvent("2025-06-01T09:00", "2025-06-01T17:00", "Ancien");
    const recent = await insertEvent("2026-02-01T09:00", "2026-02-01T17:00", "Récent");
    for (const eventId of [old, recent]) {
      await env.DB.prepare(
        "INSERT INTO registrations (id, event_id, name, email, consent_at, created_at) VALUES (?, ?, 'X', 'x@example.com', 'c', 'c')",
      )
        .bind(crypto.randomUUID(), eventId)
        .run();
    }

    expect(await purgeExpiredRegistrations(env, now)).toBe(1);
    const left = await env.DB.prepare("SELECT event_id FROM registrations").all<{ event_id: string }>();
    expect(left.results.map((r) => r.event_id)).toEqual([recent]);
  });
});

describe("QR redirect", () => {
  it("sends /qr to the discover page by default", async () => {
    const response = await call("/qr");
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://example.test/decouvrir/");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("follows the target saved in the settings, relative or absolute", async () => {
    let saved = await call("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ qrTarget: "/#evenements" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(saved.status).toBe(200);
    expect(((await saved.json()) as { data: { qrTarget: string; showCurrentEvents: boolean } }).data).toEqual({
      qrTarget: "/#evenements",
      showCurrentEvents: true,
    });
    expect((await call("/qr/flyer")).headers.get("Location")).toBe("https://example.test/#evenements");

    saved = await call("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ qrTarget: "https://www.facebook.com/terraindomitaqc" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(saved.status).toBe(200);
    expect((await call("/qr")).headers.get("Location")).toBe("https://www.facebook.com/terraindomitaqc");
  });

  it("rejects a target that is neither a path nor an https URL", async () => {
    await call("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ qrTarget: "/decouvrir/" }),
      headers: { "Content-Type": "application/json" },
    });
    for (const qrTarget of ["javascript:alert(1)", "http://example.com", "evenements", ""]) {
      const response = await call("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ qrTarget }),
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status).toBe(400);
    }
    expect((await call("/qr")).headers.get("Location")).toBe("https://example.test/decouvrir/");
  });
});

describe("canonical host", () => {
  it("redirects www to the apex, keeping the path", async () => {
    const request = new Request("https://www.terra-indomita.ca/confidentialite/?a=1") as Request<
      unknown,
      IncomingRequestCfProperties
    >;
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe("https://terra-indomita.ca/confidentialite/?a=1");
  });
});

describe("staging", () => {
  const staging = { SITE_ENV: "staging" } as Partial<Env>;

  it("marks every response noindex and serves a deny-all robots.txt", async () => {
    const robots = await call("/robots.txt", {}, staging);
    expect(await robots.text()).toContain("Disallow: /");
    expect(robots.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");

    const api = await call("/api/settings", {}, staging);
    expect(api.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
