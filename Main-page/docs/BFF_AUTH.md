# Auth0 Backend-for-Frontend (BFF) — Main-page

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/login` | Redirects to Auth0 `/authorize` with `response_type=code`, PKCE (`S256`), optional `screen_hint=signup`, `returnTo` query (path only). |
| GET | `/api/auth/callback` | Exchanges `code` + `code_verifier` for tokens (client secret server-side), verifies **ID token** with JWKS, creates server session, sets cookies, redirects to `returnTo`. |
| GET | `/api/auth/me` | Returns `{ authenticated, sub, email, name, picture }` from session (no access token to the browser). |
| POST | `/api/auth/logout` | Validates session + **CSRF**, deletes server session, clears cookies; JSON `{ federatedLogoutUrl? }` for optional Auth0 `/v2/logout` redirect. |

Protected JSON APIs (session cookie + refresh on the server):

- `GET /api/auth/sync-user` — idempotent DB sync (**no CSRF**; bootstrap uses this right after login)  
- `GET /api/onboarding-profile` — read-only, CSRF not required  
- `PUT /api/onboarding-profile` — CSRF  
- `POST /api/onboarding/complete` — CSRF  

There is **no** separate `/api/auth/refresh` route: refresh runs inside `requireBffSession` when the access token is near expiry.

## Token & session storage

- **In-memory `Map`** (`server/bff/store.mjs`): `sessionId` → `{ sub, email, name, picture, accessToken, refreshToken, accessTokenExpiresAt, csrfToken }`.  
- **Production:** replace with Redis or a database and encrypt tokens at rest.  
- **Pending OAuth** (state → PKCE verifier) TTL ~15 minutes, same store.

## Cookie strategy (recommended pattern)

- **`bff_sid`**: HTTP-only, `SameSite` strict (prod) / lax (dev), `Secure` in production. Session id only.  
- **`bff_csrf`**: **Not** HTTP-only (readable by JS) for double-submit; must match `X-CSRF-Token` and server `session.csrfToken` on **POST/PUT** to mutating auth routes.

## Frontend

- No `@auth0/auth0-react`. Use `credentials: "include"` on `fetch`, `bffAuthHeadersForMutation()` for CSRF + JSON on writes.  
- Login: `window.location.href = bffLoginUrl({ returnTo: "/path" })`.  
- Logout: `bffLogout(window.location.origin)` (POST then optional federated redirect).

## Auth0 dashboard

1. Application type: **Regular Web Application** (has client secret).  
2. **Allowed Callback URLs:** `https://your-prod-domain/api/auth/callback` and `http://localhost:5173/api/auth/callback`.  
3. **Allowed Logout URLs:** site origin(s).  
4. Enable **Refresh Token** rotation in API settings if you use `offline_access` (already requested).  
5. Optional: create an **API** and set `AUTH0_AUDIENCE` to its identifier for API-scoped access tokens.

## Environment variables

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_CALLBACK_URL`  
- Optional: `AUTH0_AUDIENCE`  
- `DATABASE_URL` / `DIRECT_URL` for Prisma  

## Security checklist

- [x] Access/refresh tokens never exposed to browser JS  
- [x] HTTP-only session cookie  
- [x] CSRF on state-changing authenticated requests  
- [x] PKCE on authorization code flow  
- [x] ID token verified with JWKS after callback  
- [x] `SameSite` + `Secure` (prod) on cookies  
- [ ] Rate limit `/api/auth/login` and `/api/auth/callback` (add in production)  
- [ ] Persist sessions in Redis/DB for multi-instance deploys  
- [ ] HTTPS everywhere in production  

## Dev

Run API and Vite together: `npm run dev:api` (port 3000) and `npm run dev` (5173, proxies `/api`).
