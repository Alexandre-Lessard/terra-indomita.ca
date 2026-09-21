// Secrets are set with `wrangler secret put` and do not appear in
// wrangler.jsonc, so `wrangler types` cannot see them.
interface Env {
  /** Turnstile secret for the environment's widget. Unset in local development. */
  TURNSTILE_SECRET_KEY?: string;
  /** Optional dead man's switch pinged after the nightly retention job. */
  HEARTBEAT_URL?: string;
}
