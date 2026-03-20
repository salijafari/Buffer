# What blocks `/onboarding/flow` from loading (handoff doc)

Stack: **Vite** (`Main-page`), **Clerk React**, **Express + Prisma** (`server/index.mjs`), browser calls **`/api/*`** (proxied to port **3000** in `vite.config.ts`).

**Onboarding status is DB-only** (`UserOnboardingProfile.onboarding_completed`). Clerk is auth only; there is **no** Clerk `unsafeMetadata` fallback for onboarding.

---

## 1. Before React / Clerk mount (`main.tsx`)

### 1.1 Publishable key validation (hard block)

**File:** `src/lib/clerkPublishableKey.ts`  
**Runs:** once at module load from `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` (or `VITE_PUBLIC_CLERK_PUBLISHABLE_KEY`).

If `validateClerkPublishableKey()` fails:

- The app renders **`ClerkPublishableKeyError`** only — **no `ClerkProvider`**, no routes, **you never reach `/onboarding/flow`**.

**Note:** Vite only exposes env vars prefixed with `VITE_`. Editing `.env` requires **restarting** `npm run dev`.

---

## 2. Route guard: `OnboardingFlowGate` (`main.tsx`)

**Path:** `/onboarding/flow` renders `<OnboardingFlowGate />`, which runs **`bootstrapOnboardingFromDb`** (`src/app/lib/onboardingStatus.ts`).

### 2.1 Clerk not loaded

- `useAuth().isLoaded === false` or `useUser().isLoaded === false`
- **UI:** `<AuthLoadingScreen />` (spinner).

### 2.2 No signed-in user

- `!user` → `<Navigate to="/onboarding" replace />`

### 2.3 Bootstrap (spinner, redirect, or flow)

Within **15 seconds** (single `AbortController` + timeout):

1. **`POST /api/auth/sync-user`** — ensures a `UserOnboardingProfile` row exists (creates from Clerk on first login).
2. If sync reports **`onboarding_completed: true`** → **`<Navigate to="/dashboard" />`**.
3. Else **`GET /api/onboarding-profile`** — if **404**, gate passes **`profile: null`** into `OnboardingFlow` (error banner + retry).

While bootstrap runs:

- **UI:** `<AuthLoadingScreen phase="onboarding" />` (spinner + after 6s: hint about **`npm run dev:api`**).

On failure → show flow with **`profile: null`** (retry).

---

## 3. `OnboardingFlow` (`src/app/pages/OnboardingFlow.tsx`)

- Receives **`profile` from the gate** (prop). **No** inner init spinner; **no** redirect to `/dashboard` except after **`POST /api/onboarding/complete`** succeeds on the final step.
- If **`profile` is `null`** → “Profile not found” + **Retry** (re-runs gate bootstrap).

---

## 4. Backend

- **`CLERK_SECRET_KEY`**, **`DATABASE_URL`**, API on **3000** (`npm run dev:api`).
- **`GET /api/onboarding-profile`** returns **404** if no row.
- **`PUT /api/onboarding-profile`** saves step data; does **not** set `onboarding_completed` from the client (completion is **`POST /api/onboarding/complete`**).

---

## 5. Key files

| Concern | File |
|--------|------|
| Gate + dashboard guard | `src/main.tsx` |
| Bootstrap pipeline | `src/app/lib/onboardingStatus.ts` |
| API client | `src/app/lib/onboardingApi.ts` |
| Types + provinces | `src/app/lib/onboardingProfile.ts` |
| Flow UI | `src/app/pages/OnboardingFlow.tsx` |
| Server | `server/index.mjs` |
| Prisma | `prisma/schema.prisma` |
