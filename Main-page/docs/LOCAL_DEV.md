# Local development (Main-page)

## 1. Install

```bash
cd Main-page
npm install
```

## 2. Environment files

The API loads **`Main-page/.env`**, then **`Main-page/.env.local`** with override **only in non-production** (`NODE_ENV !== "production"`). On Railway (`NODE_ENV=production`), `.env.local` is ignored so it can never override platform env vars if a file were accidentally present in the image.

- Copy **`Main-page/.env.example`** → **`.env`** and/or **`.env.local`**
- Put secrets only in **`.env.local`** (gitignored)

Minimum for auth + DB:

```env
AUTH0_DOMAIN=auth.mybuffer.ca
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_CALLBACK_URL=http://localhost:5173/api/auth/callback
AUTH0_LOGOUT_RETURN_URL=http://localhost:5173
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

Optional aliases (also read by the server):

- `LOGOUT_REDIRECT_URL` — same role as `AUTH0_LOGOUT_RETURN_URL`

`SESSION_SECRET` / `BACKEND_API_URL` are optional; the current BFF does not require them.

## 3. Auth0 dashboard (dev)

For the **same** Auth0 application as `AUTH0_CLIENT_ID`:

- **Allowed Callback URLs:** `http://localhost:5173/api/auth/callback`
- **Allowed Logout URLs:** `http://localhost:5173`
- **Allowed Web Origins:** `http://localhost:5173`

## 4. Database

**Run Prisma from `Main-page/`** (or use root scripts below). If you run `npx prisma …` from the repo root, Prisma won’t find `prisma/schema.prisma`.

From **`Main-page/`**:

```bash
cd Main-page
npx prisma migrate dev --schema prisma/schema.prisma
# or:
npm run prisma:migrate
```

From **repo root** (`Buffer/`):

```bash
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:generate
```

## 5. Run (two terminals)

**Terminal A — API (port 3000):**

```bash
cd Main-page
npm run dev:api
```

**Terminal B — Vite (port 5173, proxies `/api` → 3000):**

```bash
cd Main-page
npm run dev
```

Open **http://localhost:5173**.

## 6. Troubleshooting

| Issue | Check |
|--------|--------|
| Callback URL mismatch | Auth0 callback must match `AUTH0_CALLBACK_URL` exactly |
| `/api/*` 404 from browser | Vite not running or proxy; use `:5173` not `:3000` for the SPA |
| Session lost on each request | Use a single API process locally; on Railway use 1 replica or Redis for sessions |
