# What blocks `/onboarding/flow` from loading (handoff doc)

Stack: **Vite** (`Main-page`), **Auth0 BFF** (Express `server/bff/*` + cookie session), **Express + Prisma** (`server/index.mjs`), browser calls **`/api/*`** (proxied to port **3000** in `vite.config.ts`).

**Onboarding status is DB-only** (`UserOnboardingProfile.onboarding_completed`). Auth subject is Auth0 `sub` (stored in `clerk_user_id` column for historical reasons).

---

## 1. Before React / session check (`main.tsx`)

### 1.1 BFF session

**Files:** `src/lib/BffAuthContext.tsx`, `src/lib/bffSession.ts`  
**Runs:** `GET /api/auth/me` with `credentials: "include"` on load.

If the API is down or cookies are missing, the app may show **logged-out** state or onboarding errors — you still need a successful **login** via `GET /api/auth/login` → Auth0 → `GET /api/auth/callback` so `bff_sid` / `bff_csrf` are set.

**Note:** Use **`npm run dev`** (port **5173** + `--strictPort`) and **`AUTH0_CALLBACK_URL=http://localhost:5173/api/auth/callback`** so the browser callback matches Auth0 settings.

---

## 2. `/onboarding/flow` gate (`OnboardingFlowGate` in `main.tsx`)

**Path:** `/onboarding/flow` renders `<OnboardingFlowGate />`, which runs **`bootstrapOnboardingFromDb`** (`src/app/lib/onboardingStatus.ts`).

### 2.1 Not signed in (no session cookie)

- `useBffAuth().status !== "auth"`
- **UI:** redirect to **`/onboarding`**.

### 2.2 Signed in

Within **15 seconds** (single `AbortController` + timeout):

1. **`POST /api/auth/sync-user`** — ensures a `UserOnboardingProfile` row exists (CSRF + cookies).  
2. If sync reports **`onboarding_completed: true`** → **`<Navigate to="/dashboard" />`**.  
3. Else **`GET /api/onboarding-profile`** — ensures row exists, returns profile. **`profile: null`** means network/auth failure (401, 500), not “missing row”.

While bootstrap runs:

- **UI:** `<AuthLoadingScreen phase="onboarding" />`.

On failure → show flow with **`profile: null`** (retry).

---

## 3. `OnboardingFlow` (`src/app/pages/OnboardingFlow.tsx`)

- Receives **`profile` from the gate** (prop). **No** inner init spinner; **no** redirect to `/dashboard` except after **`POST /api/onboarding/complete`** succeeds on the final step.  
- If **`profile` is `null`** → “Can’t load your profile” + **Retry** (re-runs gate bootstrap).

---

## 4. Backend

- **`AUTH0_DOMAIN`**, **`AUTH0_CLIENT_ID`**, **`AUTH0_CLIENT_SECRET`**, **`AUTH0_CALLBACK_URL`**, optional **`AUTH0_AUDIENCE`**, **`DATABASE_URL`**, API on **3000** (`npm run dev:api`).  
- **`GET /api/onboarding-profile`** creates the row if missing (shared **`ensureUserOnboardingProfile`** with sync-user), then returns **200** + profile.  
- **`PUT /api/onboarding-profile`** saves step data; does **not** set `onboarding_completed` from the client (completion is **`POST /api/onboarding/complete`**).  
- Mutating routes require **`X-CSRF-Token`** matching the **`bff_csrf`** cookie. See **`docs/BFF_AUTH.md`**.

---

## 5. Quick map

| Concern | File |
|--------|------|
| Gate + dashboard guard | `src/main.tsx` (`BffAuthProvider`, `useBffAuth`) |
| Bootstrap pipeline | `src/app/lib/onboardingStatus.ts` |
| API client | `src/app/lib/onboardingApi.ts` |
| BFF routes | `server/bff/registerAuth.mjs`, `server/bff/sessionAuth.mjs` |
| Types + provinces | `src/app/lib/onboardingProfile.ts` |
