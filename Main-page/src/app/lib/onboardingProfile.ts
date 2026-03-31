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

/** Employment / job status (annual income step; persisted as string key). */
export type JobStatus =
  | "employed_full_time_30_plus"
  | "employed_part_time_under_30"
  | "self_employed"
  | "unemployed_looking"
  | "retired_still_working"
  | "retired_not_working"
  | "not_in_workforce"
  | "studying_and_working"
  | "other";

export const JOB_STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "employed_full_time_30_plus", label: "Employed full-time, that is, 30 or more hours per week" },
  { value: "employed_part_time_under_30", label: "Employed part-time, that is, less than 30 hours per week" },
  { value: "self_employed", label: "Self-employed" },
  { value: "unemployed_looking", label: "Unemployed, but looking for work" },
  { value: "retired_still_working", label: "Retired but still working" },
  { value: "retired_not_working", label: "Retired and not working" },
  {
    value: "not_in_workforce",
    label: "Not in the workforce (student, disability, unpaid household work, unemployed and not looking for work)",
  },
  { value: "studying_and_working", label: "Studying and working" },
  { value: "other", label: "Other" },
];

/** Nova Scotia and Quebec: product not available in these provinces yet. */
export const PROVINCE_CODES_UNAVAILABLE = ["NS", "QC"] as const;

export function isProvinceUnavailable(code: string): boolean {
  return (PROVINCE_CODES_UNAVAILABLE as readonly string[]).includes(code);
}

export function parseJobStatus(s: string | null | undefined): JobStatus | null {
  if (!s || typeof s !== "string") return null;
  return JOB_STATUS_OPTIONS.some((o) => o.value === s) ? (s as JobStatus) : null;
}

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
  job_status: JobStatus | null;
  job_status_other: string;
  heard_about_us: AcquisitionSource | null;
  heard_about_us_other: string;
  /** disconnected | connected — from server after Plaid Link (Phase 1). */
  plaid_connection_status?: string;
  created_at: string;
  updated_at: string;
};
