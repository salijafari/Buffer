# Plaid integration (Buffer Main-page)

## Phase 1 — Link + storage

- **POST `/api/plaid/create-link-token`** — BFF session + CSRF. Products: `transactions`, `liabilities`, `auth`, `country_codes: [CA]`, `transactions.days_requested: 365`, optional webhook. If an item is in `error` / `login_required`, Link runs in **update mode** with that item’s `access_token`.
- **POST `/api/plaid/exchange-token`** — Exchanges `public_token`, encrypts and stores `access_token`, upserts `plaid_items` / `plaid_accounts`, sets `plaid_connection_status = connected`, then kicks off **post-link sync** (see below).
- **GET `/api/plaid/connection-status`** — `{ connected, status }`.

**DB (Phase 1 migration):** `plaid_items`, `plaid_accounts`, `plaid_connection_status` — `prisma/migrations/20260323120000_plaid_phase1/`.

## Phases 2–8 — Sync, dashboard API, webhooks

**Post-link / manual sync** (`server/bff/plaidSyncEngine.mjs`):

1. `/accounts/get` → upsert `plaid_accounts` (balances).
2. `/liabilities/get` → upsert `credit_card_liabilities` (1:1 with `plaid_accounts.id`).
3. `/transactions/sync` → upsert/remove `plaid_transactions` (cursor on `plaid_items.transactions_cursor`).
4. `/auth/get` → upsert `bank_account_details` (encrypted institution/branch/account for PAD).

**HTTP routes** (`server/bff/registerPlaidDashboard.mjs`):

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/dashboard/overview` | Cards + serialized payoff timeline + optional `aiInsight`. |
| GET | `/api/plaid/liabilities` | Liability rows for the session user. |
| POST | `/api/plaid/sync` | Full sync for all active items (CSRF). |
| GET | `/api/transactions/summary?days=30` | Spend/income totals + category rollup. |
| GET | `/api/transactions/income` | Heuristic monthly income from categorized inflows. |
| GET | `/api/plaid/auth` | Masked PAD metadata only (no decrypted numbers). |
| GET | `/api/plaid/balance` | On-demand `/accounts/balance/get` per item. |
| POST | `/api/plaid/create-update-link-token` | Body `{ "item_id": "<Plaid item_id>" }` or defaults to latest errored item. |
| POST | `/webhooks/plaid` | No session; logs `plaid_webhook_logs`, runs transaction sync on `TRANSACTIONS` updates, updates item status on `ITEM` errors. |

**Frontend:** `src/lib/dashboardApi.ts` — **Overview** and **Payoff** (post-connection) call `/api/dashboard/overview` when loaded; sync banner + **Run sync** uses `POST /api/plaid/sync`.

**DB (Phases 2–8 migration):** `credit_card_liabilities`, `plaid_transactions`, `bank_account_details`, `plaid_webhook_logs` — `prisma/migrations/20260324100000_plaid_phases_2_8/`.

## Env

See `.env.example`.

- **`PLAID_CLIENT_ID`** — required.
- **`PLAID_SECRET`** — non-sandbox environments.
- **`PLAID_SANDBOX_SECRET`** — optional; when `PLAID_ENV=sandbox`, preferred over `PLAID_SECRET` (typical in `.env.local`).
- **`PLAID_ENV`** — `sandbox` | `development` | `production`.
- **`PLAID_WEBHOOK_URL`** — public URL to `POST /webhooks/plaid` (e.g. ngrok/Railway).
- **`PLAID_ACCESS_TOKEN_ENCRYPTION_KEY`** — **required in production** (32-byte base64).

Dev-only token encryption fallback uses `getPlaidSecret()` (sandbox secret or `PLAID_SECRET`) for the scrypt password when the base64 key is unset.

## Commands

```bash
cd Main-page
npx prisma migrate deploy   # applies Phase 1 + 2–8 tables
npx prisma generate
npm run dev:api             # :3000
npm run dev                 # :5173, proxies /api → :3000
```

## Sandbox

Use **user_good** / **pass_good** in Link. After exchange, allow a short delay for sync; if Overview still shows the yellow banner, use **Run sync** or wait for webhooks.
