import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessIdentity {
  email: string;
}

const jwksByTeam = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  let jwks = jwksByTeam.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
    jwksByTeam.set(teamDomain, jwks);
  }
  return jwks;
}

/**
 * Verifies the Cloudflare Access JWT on a request. Access already blocks
 * unauthenticated traffic at the edge; this check makes sure a request that
 * reaches the Worker another way (misconfigured policy, workers.dev) is still
 * refused. Local development opts out with AUTH_MODE=dev; any other value
 * fails closed.
 */
export async function verifyAccess(request: Request, env: Env): Promise<AccessIdentity | null> {
  if (env.AUTH_MODE === "dev") return { email: "dev@localhost" };

  const teamDomain = "ACCESS_TEAM_DOMAIN" in env ? env.ACCESS_TEAM_DOMAIN : undefined;
  const audience = "ACCESS_AUD" in env ? env.ACCESS_AUD : undefined;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!teamDomain || !audience || !token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      issuer: teamDomain,
      audience,
    });
    const email = typeof payload.email === "string" ? payload.email : "jeton-de-service";
    return { email };
  } catch {
    return null;
  }
}
