# Auth0 Backend-for-Frontend (BFF) — Main-page

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/login` | Redirects to Auth0 `/authorize` with `response_type=code`, PKCE (`S256`), optional `screen_hint=signup`, `returnTo` query (path only). |
| GET | `/api/auth/callback` | Auth0 redirects with `?code=&state=`. Exchanges code for tokens, verifies **ID token**, creates BFF session + cookies, runs **`ensureUserOnboardingProfile`** (Prisma), then redirects: **`/dashboard`** if `onboarding_completed`, else **`/onboarding/flow`**. If DB ensure fails → `/onboarding/flow`. Auth0 **Allowed Callback URLs** must include this path on your public origin (e.g. `http://localhost:5173/api/auth/callback`). |
| GET | `/api/auth/me` | Returns `{ authenticated, sub, email, name, picture }` from session (no access token to the browser). |
| POST | `/api/auth/logout` | Validates session + **CSRF**, deletes server session, clears cookies; JSON `{ federatedLogoutUrl? }` for optional Auth0 `/v2/logout` redirect. **`returnTo`** for Auth0 is resolved server-side: **`AUTH0_LOGOUT_RETURN_URL`** (recommended) → else request body → else origin of **`AUTH0_CALLBACK_URL`**. Add that exact URL to Auth0 **Allowed Logout URLs** (including `https` / `www`). |

Protected JSON APIs (session cookie + refresh on the server):

- `GET /api/auth/sync-user` — idempotent DB sync (**no CSRF**; bootstrap uses this right after login). Creates a `user_onboarding_profiles` row for the current Auth0 `sub` if missing. After account deletion there is no row until they sign up again (**new** `sub` / new row — same email is a fresh user).  
- `GET /api/onboarding-profile` — read-only, CSRF not required  
- `PUT /api/onboarding-profile` — CSRF  
- `POST /api/onboarding/complete` — CSRF  
- `POST /api/account/delete` — CSRF — **deletes** the `user_onboarding_profiles` row, **deletes the user in Auth0** via Management API, then clears the BFF session. Requires **Auth0 Management API** credentials (see below).

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

## Account deletion (`POST /api/account/delete`)

1. **Database:** **deletes** the `user_onboarding_profiles` row for the current Auth0 `sub` (hard delete).  
2. **Auth0:** calls Management API `DELETE /api/v2/users/{sub}` so that identity cannot sign in again.  
3. **Session:** BFF cookies cleared.

**Re-registering with the same email:** Auth0 creates a **new** user with a **new** `sub`. `ensureUserOnboardingProfile` creates a **new** profile row — no merge with any previous data.

Create a **Machine to Machine** application in Auth0 → **Auth0 Management API** → authorize **`delete:users`** (and `read:users` is optional). Use its Client ID and secret:

**Required Auth0 settings for the M2M app**

- Application type must be **Machine to Machine** (not “Regular Web Application”).
- Under **Application → Settings → Advanced Settings → Grant Types**, ensure **Client Credentials** is enabled. If you see `Grant type 'client_credentials' not allowed for the client`, turn this on (or recreate the app as M2M).

**Local check:** from `Main-page`, run `npm run verify:auth0-mgmt` — it only requests a Management API token (no user is deleted). Success means credentials work.

- **`AUTH0_MGMT_CLIENT_ID`** / **`AUTH0_MGMT_CLIENT_SECRET`** — recommended.  
- If omitted, the server falls back to **`AUTH0_CLIENT_ID`** / **`AUTH0_CLIENT_SECRET`** only if that application is allowed to obtain a Management API token (uncommon for “Regular Web” apps; prefer a dedicated M2M app).

The Management API token uses `audience=https://<host>/api/v2/` where **host** is **`AUTH0_MGMT_DOMAIN`** if set (recommended when login uses a custom domain like `auth.example.com`), otherwise **`AUTH0_DOMAIN`**.

### Smoke test (dev / opt-in prod)

`GET /api/admin/test-m2m` — exchanges M2M credentials and calls Management API `GET /users?per_page=5`. Responds with **HTTP 200** and JSON: `{ status: "success", count, sample_users, domain_used, audience }` or `{ status: "error", error, details, hint? }` (200 avoids generic browser “502” pages that hide the JSON). **Disabled in production** unless `ALLOW_ADMIN_TEST_M2M=true`.

## Environment variables

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_CALLBACK_URL`  
- Optional: `AUTH0_AUDIENCE`  
- Optional (Management API host): `AUTH0_MGMT_DOMAIN` — canonical `*.auth0.com` tenant if `AUTH0_DOMAIN` is a custom domain  
- Optional (account delete): `AUTH0_MGMT_CLIENT_ID`, `AUTH0_MGMT_CLIENT_SECRET`  
- Optional: `ALLOW_ADMIN_TEST_M2M=true` — enables `GET /api/admin/test-m2m` in production  
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

## Troubleshooting: `/onboarding?error=exchange`

That means **POST `https://<AUTH0_DOMAIN>/oauth/token`** failed after Auth0 redirected back with `?code=`. Common fixes:

1. **`AUTH0_CALLBACK_URL`** must match **exactly** one **Allowed Callback URL** in Auth0 (including `http` vs `https`, `localhost:5173`, path `/api/auth/callback`, no trailing slash mismatch).
2. **`AUTH0_CLIENT_SECRET`** must match the Auth0 application (no extra quotes/spaces in `.env`).
3. **`AUTH0_DOMAIN`** must be your tenant / custom domain (e.g. `auth.mybuffer.ca`) — same app as **Client ID**.
4. Read the API log line **`[bff] /oauth/token exchange failed:`** — Auth0’s JSON error explains `invalid_grant`, `redirect_uri` mismatch, etc.

If you see **`?error=verify`**, the ID token failed JWKS verification — usually **wrong `AUTH0_DOMAIN`** vs issuer, or wrong **Client ID** audience.
