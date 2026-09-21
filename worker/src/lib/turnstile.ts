const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's always-pass test secret, used only when developing locally.
const DEV_SECRET = "1x0000000000000000000000000000000AA";

/** The environment's secret; missing outside development means every check fails. */
export function turnstileSecret(env: Env): string {
  return env.TURNSTILE_SECRET_KEY ?? (env.SITE_ENV === "development" ? DEV_SECRET : "");
}

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}
