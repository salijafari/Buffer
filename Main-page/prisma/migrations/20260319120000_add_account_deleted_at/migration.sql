-- AlterTable
ALTER TABLE "user_onboarding_profiles" ADD COLUMN "account_deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_onboarding_profiles_account_deleted_at_idx" ON "user_onboarding_profiles"("account_deleted_at");
