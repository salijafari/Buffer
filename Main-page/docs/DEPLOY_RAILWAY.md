# Railway: fix `sync-user failed (500)` / database errors

A **500** on `GET /api/auth/sync-user` means Prisma threw while creating/reading `user_onboarding_profiles`. Almost always:

## 1. Migrations never ran on production

Your Postgres on Railway is empty or missing tables.

**Fix (pick one):**

- **Railway → your service → Settings → Deploy → Custom Release Command:**  
  `npx prisma migrate deploy`  
  Then redeploy.

- **Or** from your laptop (with network access to DB):  
  ```bash
  cd Main-page
  export DATABASE_URL="postgresql://...from Railway..."
  export DIRECT_URL="postgresql://...direct..."  # if you use Prisma Accelerate for DATABASE_URL
  npx prisma migrate deploy
  ```

## 2. `DATABASE_URL` / `DIRECT_URL` wrong

- Add the **Postgres** plugin on Railway and copy the connection string into variables.
- If you use **Prisma Accelerate**, `DATABASE_URL` is the Accelerate URL; keep **`DIRECT_URL`** as the **direct** Postgres URL (required for migrations in some setups).

## 3. `postinstall` / client

`package.json` includes `"postinstall": "prisma generate"` so the Prisma Client is generated on install.

## 4. Verify

- Open `GET /api/health` — should return `{ ok: true, database: "connected" }`.
- If health fails, fix `DATABASE_URL` before anything else.

After migrations, `sync-user` should return **200** with `onboarding_completed`.
