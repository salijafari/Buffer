export const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export type InterestSelection =
  | "refinance_credit_card_balance"
  | "build_credit_faster"
  | "ai_debt_management_recommendation"
  | "none_of_the_above";

export type AcquisitionSource =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "app_store"
  | "google"
  | "reddit"
  | "youtube"
  | "linkedin"
  | "other";

export type UserOnboardingProfile = {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  interest_selection: InterestSelection | null;
  interest_custom_text: string;
  province_code: string;
  province_name: string;
  credit_score: number | null;
  annual_pre_tax_income: number | null;
  heard_about_us: AcquisitionSource | null;
  heard_about_us_other: string;
  created_at: string;
  updated_at: string;
};
