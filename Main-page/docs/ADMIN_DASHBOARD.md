# Admin dashboard (`/admin`)

## Access

- **URL:** `/admin` (and `/admin/users`, `/admin/users/:id`, `/admin/admins`).
- **Login:** Same Auth0 BFF session as the main app (`RequireAuth`). **Onboarding does not need to be completed** to open `/admin`.
- **Authorization:** Email must match an **active** row in `admin_grants` (not revoked), or be in the server bootstrap list in `server/bff/adminAccess.mjs` (`INITIAL_ADMIN_EMAILS`: `ali@mybuffer.ca`, `masoud@mybuffer.ca`). First verify upserts a grant for bootstrap emails.
- **403:** Non-admins see an access-denied screen (frontend); API returns `403` JSON for protected routes.

## Database

- `user_onboarding_profiles.removed_at` — set when an admin deletes a user (after Auth0 delete). Those rows are excluded from stats and user lists.
- `user_onboarding_profiles.is_admin` — denormalized when granting/revoking admin (optional; source of truth is `admin_grants`).
- `admin_grants` — `user_email` (unique, lowercased), `granted_by`, `granted_at`, `revoked_at`.

Run migrations: `npx prisma migrate deploy` (or `migrate dev` locally).

## API (all require session cookie; mutating routes require CSRF)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/verify` | `{ isAdmin, email }` |
| GET | `/api/admin/stats` | Onboarding aggregates + `byStep` |
| GET | `/api/admin/users` | `?page=&limit=&search=&sort=&order=` |
| GET | `/api/admin/users/:userId` | Full profile |
| DELETE | `/api/admin/users/:userId` | Auth0 delete + `removed_at` |
| GET | `/api/admin/admins` | Active admins |
| POST | `/api/admin/admins` | Body `{ email }` — grant |
| DELETE | `/api/admin/admins/:emailEnc` | Revoke (`encodeURIComponent` on client) |

**Auth0 Management API** (`delete:users`) must be configured for user delete (same as account self-delete).

## Security notes

- Rate limiting not implemented yet; add at reverse proxy or Express middleware in production.
- Do not expose M2M secrets to the browser.
