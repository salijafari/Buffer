-- CreateTable
CREATE TABLE "user_onboarding_profiles" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_step" INTEGER NOT NULL DEFAULT 1,
    "interest_selection" TEXT,
    "interest_custom_text" TEXT,
    "province_code" TEXT,
    "province_name" TEXT,
    "credit_score" INTEGER,
    "annual_pre_tax_income" INTEGER,
    "heard_about_us" TEXT,
    "heard_about_us_other" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_onboarding_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_profiles_clerk_user_id_key" ON "user_onboarding_profiles"("clerk_user_id");

-- CreateIndex
CREATE INDEX "user_onboarding_profiles_onboarding_completed_onboarding_st_idx" ON "user_onboarding_profiles"("onboarding_completed", "onboarding_step");

-- CreateIndex
CREATE INDEX "user_onboarding_profiles_province_code_idx" ON "user_onboarding_profiles"("province_code");

-- CreateIndex
CREATE INDEX "user_onboarding_profiles_heard_about_us_idx" ON "user_onboarding_profiles"("heard_about_us");
