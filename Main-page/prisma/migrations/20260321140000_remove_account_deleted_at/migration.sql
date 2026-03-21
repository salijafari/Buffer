-- Drop soft-delete column; account removal now deletes the row entirely.
DROP INDEX IF EXISTS "user_onboarding_profiles_account_deleted_at_idx";
ALTER TABLE "user_onboarding_profiles" DROP COLUMN IF EXISTS "account_deleted_at";
