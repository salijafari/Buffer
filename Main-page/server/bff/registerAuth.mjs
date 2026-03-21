import { randomBytes } from "node:crypto";
import {
  savePendingOAuth,
  takePendingOAuth,
  createSessionRecord,
  deleteSessionRecord,
  getSessionRecord,
} from "./store.mjs";
import {
  getBffOAuthConfig,
  issuerFromDomain,
  generatePkcePair,
  buildAuthorizeUrl,
  exchangeAuthorizationCode,
  buildLogoutUrl,
} from "./oauth.mjs";
import {
  verifyIdToken,
  newCsrfToken,
  cookieOptions,
  csrfCookieOptions,
  requireBffSessionLoose,
  requireBffCsrf,
} from "./sessionAuth.mjs";

const SESSION_COOKIE = "bff_sid";
const CSRF_COOKIE = "bff_csrf";

/**
 * Registers BFF OAuth routes (login, callback, me, logout).
 */
export function registerBffAuthRoutes(app) {
  app.get("/api/auth/me", (req, res) => {
    const sid = req.cookies?.bff_sid;
    if (!sid) {
      return res.status(401).json({ authenticated: false });
    }
    const session = getSessionRecord(sid);
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }
    return res.json({
      authenticated: true,
      sub: session.sub,
      email: session.email,
      name: session.name,
      picture: session.picture,
    });
  });

  const cfg = getBffOAuthConfig();

  if (!cfg.ok) {
    console.warn(`[bff] OAuth not fully configured (${cfg.error}); login/callback disabled.`);
    app.get("/api/auth/login", (_req, res) => {
      res.status(503).json({ error: "Auth not configured", missing: cfg.error });
    });
    app.get("/api/auth/callback", (_req, res) => {
      res.redirect(302, "/onboarding?error=config");
    });
  } else {
    app.get("/api/auth/login", (req, res) => {
      const returnTo =
        typeof req.query.returnTo === "string" && req.query.returnTo.startsWith("/")
          ? req.query.returnTo
          : "/";
      const screenHint = req.query.screen_hint === "signup" ? "signup" : undefined;
      const state = randomBytes(24).toString("hex");
      const { codeVerifier, codeChallenge } = generatePkcePair();
      savePendingOAuth(state, { codeVerifier, returnTo });
      const url = buildAuthorizeUrl({
        domain: cfg.domain,
        clientId: cfg.clientId,
        redirectUri: cfg.callbackUrl,
        state,
        codeChallenge,
        audience: cfg.audience,
        screenHint,
      });
      return res.redirect(302, url);
    });

    app.get("/api/auth/callback", async (req, res) => {
      const code = req.query.code;
      const state = req.query.state;
      const err = req.query.error_description || req.query.error;
      if (err) {
        console.warn("[bff] callback error:", err);
        return res.redirect(302, "/onboarding?error=auth");
      }
      if (typeof code !== "string" || typeof state !== "string") {
        return res.redirect(302, "/onboarding?error=auth");
      }
      const pending = takePendingOAuth(state);
      if (!pending?.codeVerifier) {
        return res.redirect(302, "/onboarding?error=state");
      }
      try {
        const tokens = await exchangeAuthorizationCode({
          domain: cfg.domain,
          clientId: cfg.clientId,
          clientSecret: cfg.clientSecret,
          code,
          redirectUri: cfg.callbackUrl,
          codeVerifier: pending.codeVerifier,
        });
        if (!tokens.id_token) {
          throw new Error("missing id_token");
        }
        const issuer = issuerFromDomain(cfg.domain);
        const idPayload = await verifyIdToken(tokens.id_token, issuer, cfg.clientId);
        const csrfToken = newCsrfToken();
        const expiresAt = Date.now() + (Number(tokens.expires_in) || 3600) * 1000;
        const sessionId = createSessionRecord({
          sub: idPayload.sub,
          email: typeof idPayload.email === "string" ? idPayload.email : null,
          name: typeof idPayload.name === "string" ? idPayload.name : null,
          picture: typeof idPayload.picture === "string" ? idPayload.picture : null,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          accessTokenExpiresAt: expiresAt,
          csrfToken,
        });
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        res.cookie(SESSION_COOKIE, sessionId, { ...cookieOptions(), maxAge });
        res.cookie(CSRF_COOKIE, csrfToken, { ...csrfCookieOptions(), maxAge });
        return res.redirect(302, pending.returnTo || "/");
      } catch (e) {
        console.error("[bff] callback exchange failed:", e?.message ?? e);
        return res.redirect(302, "/onboarding?error=exchange");
      }
    });
  }

  app.post("/api/auth/logout", requireBffSessionLoose, requireBffCsrf, (req, res) => {
    deleteSessionRecord(req.bffSessionId);
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: 0 });
    res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions(), maxAge: 0 });
    const c = getBffOAuthConfig();
    let federatedLogoutUrl = null;
    if (c.ok) {
      const returnTo =
        typeof req.body?.returnTo === "string" && req.body.returnTo.startsWith("http")
          ? req.body.returnTo
          : null;
      if (returnTo) {
        federatedLogoutUrl = buildLogoutUrl({
          domain: c.domain,
          clientId: c.clientId,
          returnTo,
        });
      }
    }
    return res.json({ ok: true, federatedLogoutUrl });
  });

  return { enabled: cfg.ok };
}
