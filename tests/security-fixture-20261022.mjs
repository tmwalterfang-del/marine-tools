import { generateKeyPair, exportJWK, SignJWT } from "jose";
export const issuer =
  "https://marine-tools-security-fixture.cloudflareaccess.com";
export const audience = "fixture-admin-audience";
const pair = await generateKeyPair("RS256", { extractable: true });
const jwk = {
  ...(await exportJWK(pair.publicKey)),
  kid: "fixture-key",
  alg: "RS256",
  use: "sig",
};
export const jwks = { keys: [jwk] };
export const allowLimit = {
  async limit() {
    return { success: true };
  },
};
export const securityEnv = {
  ACCESS_TEAM_DOMAIN: issuer,
  ACCESS_AUD: audience,
  PUBLIC_API_LIMITER: allowLimit,
  ANALYTICS_LIMITER: allowLimit,
  ADMIN_LIMITER: allowLimit,
};
export async function token(claims = {}, options = {}) {
  return new SignJWT({ email: "owner@example.invalid", ...claims })
    .setProtectedHeader({ alg: "RS256", kid: "fixture-key", ...options })
    .setIssuer(claims.iss ?? issuer)
    .setAudience(claims.aud ?? audience)
    .setSubject(claims.sub ?? "synthetic-owner")
    .setIssuedAt(claims.iat ?? Math.floor(Date.now() / 1000))
    .setExpirationTime(claims.exp ?? Math.floor(Date.now() / 1000) + 3600)
    .sign(pair.privateKey);
}
export const headers = {
  "cf-access-jwt-assertion": await token(),
  "cf-access-authenticated-user-email": "spoofed@example.invalid",
};
export function installJwksFetch(
  next = () => {
    throw Error("Unexpected external request");
  },
) {
  const before = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const u = new URL(input instanceof Request ? input.url : input);
    if (u.origin === issuer && u.pathname === "/cdn-cgi/access/certs")
      return new Response(JSON.stringify(jwks), {
        headers: { "content-type": "application/json" },
      });
    return next(input, init);
  };
  return () => {
    globalThis.fetch = before;
  };
}
