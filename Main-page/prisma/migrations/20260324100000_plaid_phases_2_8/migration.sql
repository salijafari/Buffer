-- Phase 2–8: liabilities, transactions, PAD auth storage, webhook audit

CREATE TABLE IF NOT EXISTS "credit_card_liabilities" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "purchase_apr" DECIMAL(12,6),
    "balance_transfer_apr" DECIMAL(12,6),
    "cash_apr" DECIMAL(12,6),
    "current_balance" DECIMAL(18,2),
    "credit_limit" DECIMAL(18,2),
    "available_credit" DECIMAL(18,2),
    "utilization_pct" DECIMAL(8,4),
    "minimum_payment" DECIMAL(18,2),
    "next_payment_due_date" DATE,
    "last_payment_amount" DECIMAL(18,2),
    "last_payment_date" DATE,
    "last_statement_balance" DECIMAL(18,2),
    "is_overdue" BOOLEAN NOT NULL DEFAULT false,
    "monthly_interest_cost" DECIMAL(18,2),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_card_liabilities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "credit_card_liabilities_plaid_account_id_key" ON "credit_card_liabilities"("plaid_account_id");
CREATE INDEX IF NOT EXISTS "credit_card_liabilities_profile_id_idx" ON "credit_card_liabilities"("profile_id");

ALTER TABLE "credit_card_liabilities" ADD CONSTRAINT "credit_card_liabilities_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_card_liabilities" ADD CONSTRAINT "credit_card_liabilities_plaid_account_id_fkey" FOREIGN KEY ("plaid_account_id") REFERENCES "plaid_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "plaid_transactions" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "plaid_transaction_id" TEXT NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "date" DATE NOT NULL,
    "datetime" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "merchant_name" TEXT,
    "category_primary" TEXT,
    "category_detailed" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "iso_currency_code" TEXT DEFAULT 'CAD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plaid_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plaid_transactions_plaid_transaction_id_key" ON "plaid_transactions"("plaid_transaction_id");
CREATE INDEX IF NOT EXISTS "plaid_transactions_profile_id_date_idx" ON "plaid_transactions"("profile_id", "date");
CREATE INDEX IF NOT EXISTS "plaid_transactions_plaid_account_id_idx" ON "plaid_transactions"("plaid_account_id");

ALTER TABLE "plaid_transactions" ADD CONSTRAINT "plaid_transactions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "bank_account_details" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "encrypted_institution" TEXT,
    "encrypted_branch" TEXT,
    "encrypted_account" TEXT,
    "account_mask" TEXT,
    "account_name" TEXT,
    "account_type" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_account_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bank_account_details_profile_id_plaid_account_id_key" ON "bank_account_details"("profile_id", "plaid_account_id");
CREATE INDEX IF NOT EXISTS "bank_account_details_profile_id_idx" ON "bank_account_details"("profile_id");

ALTER TABLE "bank_account_details" ADD CONSTRAINT "bank_account_details_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "plaid_webhook_logs" (
    "id" TEXT NOT NULL,
    "item_id" TEXT,
    "webhook_type" TEXT NOT NULL,
    "webhook_code" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_id" TEXT,

    CONSTRAINT "plaid_webhook_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "plaid_webhook_logs_item_id_idx" ON "plaid_webhook_logs"("item_id");
CREATE INDEX IF NOT EXISTS "plaid_webhook_logs_created_at_idx" ON "plaid_webhook_logs"("created_at");

ALTER TABLE "plaid_webhook_logs" ADD CONSTRAINT "plaid_webhook_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_onboarding_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
