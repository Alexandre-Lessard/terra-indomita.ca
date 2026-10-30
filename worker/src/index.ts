import { Hono } from "hono";
import { getQrTarget } from "./db";
import { verifyAccess } from "./lib/access";
import { purgeExpiredRegistrations } from "./lib/retention";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";

const api = new Hono<{ Bindings: Env }>().basePath("/api");
api.route("/admin", adminRoutes);
api.route("/", publicRoutes);
api.notFound((c) => c.json({ error: "Introuvable." }, 404));
api.onError((err, c) => {
  console.error("unhandled api error", err.message);
  return c.json({ error: "Erreur du serveur." }, 500);
});

const STAGING_ROBOTS = "User-agent: *\nDisallow: /\n";

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  // One canonical host: www.terra-indomita.ca redirects to the apex.
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }

  // The printed QR code points here; where it lands is a setting, so a flyer never goes stale.
  if (pathname === "/qr" || pathname.startsWith("/qr/")) {
    const target = new URL(await getQrTarget(env.DB), url.origin);
    return new Response(null, { status: 302, headers: { Location: target.toString(), "Cache-Control": "no-store" } });
  }

  if (pathname.startsWith("/api/")) return api.fetch(request, env, ctx);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const identity = await verifyAccess(request, env);
    if (!identity) return new Response("Accès refusé.", { status: 403 });
    const page = await env.ASSETS.fetch(request);
    const headers = new Headers(page.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(page.body, { status: page.status, headers });
  }

  if (env.SITE_ENV === "staging" && pathname === "/robots.txt") {
    return new Response(STAGING_ROBOTS, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    const response = await route(request, env, ctx);
    if (env.SITE_ENV !== "staging") return response;
    // Staging must never be indexed, whatever the page.
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      (async () => {
        const purged = await purgeExpiredRegistrations(env);
        console.log(`retention: ${purged} registration(s) purged`);
        // Optional dead man's switch: a missing ping alerts externally.
        if (env.HEARTBEAT_URL) await fetch(env.HEARTBEAT_URL);
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
