import { randomBytes } from "node:crypto";
import * as jose from "jose";
import { getBffOAuthConfig, issuerFromDomain, refreshAccessToken } from "./oauth.mjs";
import { getSessionRecord, updateSessionRecord } from "./store.mjs";

let jwksCache = null;
function getJwks(issuer) {
  if (!jwksCache || jwksCache.issuer !== issuer) {
    jwksCache = { issuer, jwks: jose.createRemoteJWKSet(new URL(".well-known/jwks.json", issuer)) };
  }
  return jwksCache.jwks;
}

export async function verifyIdToken(idToken, issuer, clientId) {
  const JWKS = getJwks(issuer);
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer,
    audience: clientId,
  });
  return payload;
}

async function ensureAccessTokenFresh(sessionId, session) {
  const cfg = getBffOAuthConfig();
  if (!cfg.ok) throw new Error("oauth_config");
  const skewMs = 60_000;
  if (session.accessTokenExpiresAt > Date.now() + skewMs) {
    return session;
  }
  if (!session.refreshToken) throw new Error("no_refresh_token");
  const data = await refreshAccessToken({
    domain: cfg.domain,
    clientId: cfg.clientId,
    clientSecret: cfg.clientSecret,
    refreshToken: session.refreshToken,
    audience: cfg.audience,
  });
  const expiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  const updated = await updateSessionRecord(sessionId, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? session.refreshToken,
    accessTokenExpiresAt: expiresAt,
  });
  if (!updated) throw new Error("session_lost");
  return updated;
}

/**
 * Populates req.auth from HTTP-only session cookie. Refreshes access token when near expiry.
 */
export async function requireBffSession(req, res, next) {
  const sid = req.cookies?.bff_sid;
  if (!sid) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  let session = getSessionRecord(sid);
  if (!session) {
    return res.status(401).json({ error: "Session expired." });
  }
  try {
    session = await ensureAccessTokenFresh(sid, session);
  } catch {
    return res.status(401).json({ error: "Session invalid." });
  }
  const cfg = getBffOAuthConfig();
  if (!cfg.ok) {
    return res.status(500).json({ error: "Server auth misconfigured." });
  }
  req.bffSessionId = sid;
  req.auth = {
    userId: session.sub,
    email: typeof session.email === "string" ? session.email : null,
    accessToken: session.accessToken,
    issuer: issuerFromDomain(cfg.domain),
  };
  return next();
}

/** For logout: only require valid session id + record (no token refresh). */
export function requireBffSessionLoose(req, res, next) {
  const sid = req.cookies?.bff_sid;
  if (!sid || !getSessionRecord(sid)) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  req.bffSessionId = sid;
  return next();
}

/**
 * Double-submit CSRF: header must match readable cookie and server session record.
 */
export function requireBffCsrf(req, res, next) {
  const sid = req.bffSessionId;
  const header = req.headers["x-csrf-token"];
  const cookie = req.cookies?.bff_csrf;
  if (!sid || typeof header !== "string" || !cookie || header !== cookie) {
    return res.status(403).json({ error: "CSRF validation failed." });
  }
  const session = getSessionRecord(sid);
  if (!session || session.csrfToken !== header) {
    return res.status(403).json({ error: "CSRF validation failed." });
  }
  return next();
}

export function newCsrfToken() {
  return randomBytes(24).toString("hex");
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    sameSite: isProd ? "strict" : "lax",
    secure: isProd,
    httpOnly: true,
  };
}

export function csrfCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    sameSite: isProd ? "strict" : "lax",
    secure: isProd,
    httpOnly: false,
  };
}
