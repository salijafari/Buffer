-- Plaid Phase 1: items, accounts, connection flag on profile

ALTER TABLE "user_onboarding_profiles" ADD COLUMN IF NOT EXISTS "plaid_connection_status" TEXT NOT NULL DEFAULT 'disconnected';

CREATE TABLE IF NOT EXISTS "plaid_items" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "encrypted_access_token" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "institution_id" TEXT,
    "institution_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "error_code" TEXT,
    "consent_expiration_time" TIMESTAMP(3),
    "transactions_cursor" TEXT,
    "last_successful_update" TIMESTAMP(3),
    "link_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plaid_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plaid_items_item_id_key" ON "plaid_items"("item_id");
CREATE INDEX IF NOT EXISTS "plaid_items_profile_id_idx" ON "plaid_items"("profile_id");

ALTER TABLE "plaid_items" ADD CONSTRAINT "plaid_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "plaid_accounts" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT,
    "official_name" TEXT,
    "type" TEXT,
    "subtype" TEXT,
    "mask" TEXT,
    "institution_id" TEXT,
    "current_balance" DECIMAL(18,2),
    "available_balance" DECIMAL(18,2),
    "credit_limit" DECIMAL(18,2),
    "iso_currency_code" TEXT DEFAULT 'CAD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plaid_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plaid_accounts_plaid_item_id_account_id_key" ON "plaid_accounts"("plaid_item_id", "account_id");
CREATE INDEX IF NOT EXISTS "plaid_accounts_profile_id_idx" ON "plaid_accounts"("profile_id");

ALTER TABLE "plaid_accounts" ADD CONSTRAINT "plaid_accounts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plaid_accounts" ADD CONSTRAINT "plaid_accounts_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "plaid_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
