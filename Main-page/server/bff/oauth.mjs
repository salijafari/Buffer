import { createHash, randomBytes } from "node:crypto";

export function getBffOAuthConfig() {
  const rawDomain = process.env.AUTH0_DOMAIN?.trim();
  if (!rawDomain) return { ok: false, error: "AUTH0_DOMAIN" };
  const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
  const callbackUrl = process.env.AUTH0_CALLBACK_URL?.trim();
  const audience = process.env.AUTH0_AUDIENCE?.trim() || undefined;
  if (!clientId) return { ok: false, error: "AUTH0_CLIENT_ID" };
  if (!clientSecret) return { ok: false, error: "AUTH0_CLIENT_SECRET" };
  if (!callbackUrl) return { ok: false, error: "AUTH0_CALLBACK_URL" };
  return { ok: true, domain, clientId, clientSecret, callbackUrl, audience };
}

export function issuerFromDomain(domain) {
  return `https://${domain}/`;
}

export function base64Url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair() {
  const codeVerifier = base64Url(randomBytes(32));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier, "utf8").digest());
  return { codeVerifier, codeChallenge };
}

export function buildAuthorizeUrl({ domain, clientId, redirectUri, state, codeChallenge, audience, screenHint }) {
  const u = new URL(`https://${domain}/authorize`);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("scope", "openid profile email offline_access");
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  if (audience) u.searchParams.set("audience", audience);
  if (screenHint) u.searchParams.set("screen_hint", screenHint);
  return u.toString();
}

export async function exchangeAuthorizationCode({ domain, clientId, clientSecret, code, redirectUri, codeVerifier }) {
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`exchange failed ${res.status}: ${t.slice(0, 500)}`);
  }
  return res.json();
}

export async function refreshAccessToken({ domain, clientId, clientSecret, refreshToken, audience }) {
  const body = {
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  };
  if (audience) body.audience = audience;
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`refresh failed ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

export function buildLogoutUrl({ domain, clientId, returnTo }) {
  const u = new URL(`https://${domain}/v2/logout`);
  u.searchParams.set("client_id", clientId);
  if (returnTo) u.searchParams.set("returnTo", returnTo);
  return u.toString();
}

/**
 * Where Auth0 should send the browser after /v2/logout.
 * Precedence: AUTH0_LOGOUT_RETURN_URL (canonical) → request body returnTo → origin of AUTH0_CALLBACK_URL.
 * Must match an entry in Auth0 → Application → Allowed Logout URLs (exact match, including https / www).
 */
export function resolveLogoutReturnTo(req) {
  const envUrl = process.env.AUTH0_LOGOUT_RETURN_URL?.trim() || process.env.LOGOUT_REDIRECT_URL?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl;
  }
  const body = req.body?.returnTo;
  if (typeof body === "string" && body.startsWith("http")) {
    return body;
  }
  const callback = process.env.AUTH0_CALLBACK_URL?.trim();
  if (callback) {
    try {
      return new URL(callback).origin;
    } catch {
      /* ignore */
    }
  }
  return null;
}
