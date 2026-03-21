-- AlterTable
ALTER TABLE "user_onboarding_profiles" ADD COLUMN "removed_at" TIMESTAMP(3),
ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "admin_grants" (
    "id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "admin_grants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_grants_user_email_key" ON "admin_grants"("user_email");
CREATE INDEX "admin_grants_user_email_idx" ON "admin_grants"("user_email");
CREATE INDEX "user_onboarding_profiles_removed_at_idx" ON "user_onboarding_profiles"("removed_at");
CREATE INDEX "user_onboarding_profiles_is_admin_idx" ON "user_onboarding_profiles"("is_admin");
