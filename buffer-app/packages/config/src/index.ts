/**
 * Buffer — shared application constants and configuration.
 * NEVER hardcode these values inline in components or pages.
 */

// ─── Canadian Provinces ──────────────────────────────────────────────────────
export interface Province {
  code:              string;
  name:              string;
  /** true = credit line is available in this province */
  creditLineEnabled: boolean;
}

/**
 * Province list loaded from config — not hardcoded in components.
 * creditLineEnabled is the eligibility gate for Outcome A vs. B routing.
 * Update this list as regulatory approvals expand — no UI changes needed.
 */
export const PROVINCES: Province[] = [
  { code: 'AB', name: 'Alberta',              creditLineEnabled: true  },
  { code: 'BC', name: 'British Columbia',     creditLineEnabled: true  },
  { code: 'MB', name: 'Manitoba',             creditLineEnabled: true  },
  { code: 'NB', name: 'New Brunswick',        creditLineEnabled: true  },
  { code: 'NL', name: 'Newfoundland',         creditLineEnabled: false },
  { code: 'NS', name: 'Nova Scotia',          creditLineEnabled: true  },
  { code: 'NT', name: 'Northwest Territories',creditLineEnabled: false },
  { code: 'NU', name: 'Nunavut',              creditLineEnabled: false },
  { code: 'ON', name: 'Ontario',              creditLineEnabled: true  },
  { code: 'PE', name: 'Prince Edward Island', creditLineEnabled: false },
  { code: 'QC', name: 'Quebec',               creditLineEnabled: true  },
  { code: 'SK', name: 'Saskatchewan',         creditLineEnabled: true  },
  { code: 'YT', name: 'Yukon',               creditLineEnabled: false },
] as const;

// ─── Financial Constants ─────────────────────────────────────────────────────
export const FINANCE = {
  /** Fallback APR when Plaid returns null/0 for a card — Bank of Canada avg */
  FALLBACK_APR:              0.2114,
  /** Buffer credit line APR floor */
  BUFFER_APR_MIN:            0.14,
  /** Buffer credit line APR ceiling */
  BUFFER_APR_MAX:            0.18,
  /** Credit Builder tradeline amount (CAD) */
  CREDIT_BUILDER_LIMIT:      1500,
  /** Monthly membership fee (CAD, post-trial) */
  MEMBERSHIP_FEE:            4.99,
  /** Free trial length in months */
  TRIAL_MONTHS:              3,
  /** Credit line qualification score threshold */
  SCORE_THRESHOLD:           660,
  /** Income threshold for credit line qualification (CAD) */
  INCOME_THRESHOLD:          40_000,
  /** Income buffer reserve percentage for recommended payment calc */
  INCOME_RESERVE_PCT:        0.15,
  /** Recommended payment cap: balance ÷ this many months */
  RECOMMENDED_PAYMENT_MONTHS:36,
  /** Canadian minimum payment: balance × this rate + monthly interest */
  MIN_PAYMENT_PCT:           0.02,
  /** Canadian minimum payment floor (CAD) */
  MIN_PAYMENT_FLOOR:         10,
  /** Plaid transaction history window for spending analysis (days) */
  PLAID_HISTORY_DAYS:        90,
  /** Minimum history to show Future 2 (days) */
  MIN_HISTORY_FOR_FUTURE2:   30,
} as const;

// ─── Data Freshness (milliseconds) ──────────────────────────────────────────
export const FRESHNESS_MS = {
  cardBalances:       15 * 60 * 1000,   // 15 min
  creditScore:        24 * 60 * 60 * 1000, // 24 hr
  transactions:        1 * 60 * 60 * 1000, // 1 hr
  bufferLineBalance:   5 * 60 * 1000,   // 5 min
  aiProactiveCards:    1 * 60 * 60 * 1000, // 1 hr
  paymentPoll:        30 * 1000,         // 30 s
} as const;

// ─── Session / Auth ──────────────────────────────────────────────────────────
export const SESSION = {
  /** Web inactivity timeout before re-auth prompt (ms) */
  WEB_TIMEOUT_MS:     30 * 60 * 1000,
  /** Mobile: re-auth required after this many hours in background */
  MOBILE_BG_HOURS:    8,
  /** API retry attempts on network error */
  RETRY_ATTEMPTS:     3,
  /** Retry backoff delays in ms (exponential: 1s, 2s, 4s) */
  RETRY_DELAYS_MS:    [1000, 2000, 4000] as const,
} as const;

// ─── Subscription Detection ──────────────────────────────────────────────────
export const SUBSCRIPTION = {
  /** Min consecutive months with same merchant to flag as subscription */
  MIN_MONTHS:                2,
  /** Amount tolerance (CAD) — flags as same subscription if within ±$2 */
  AMOUNT_TOLERANCE:          2,
  /** Monthly interval band (days) */
  MONTHLY_MIN:               28,
  MONTHLY_MAX:               32,
  /** Quarterly interval band (days) */
  QUARTERLY_MIN:             85,
  QUARTERLY_MAX:             95,
  /** Annual interval band (days) */
  ANNUAL_MIN:                360,
  ANNUAL_MAX:                370,
  /** Days of inactivity before flagging subscription as "possibly unused" */
  UNUSED_INACTIVITY_DAYS:    30,
} as const;

// ─── PAD / VoPay ─────────────────────────────────────────────────────────────
export const PAD = {
  /** Mandatory cancellation notice period (calendar days) */
  CANCELLATION_NOTICE_DAYS: 30,
  VOPAY_FINTRAC_MSB:         'TODO_VOPAY_MSB_REG_NUMBER',
  VOPAY_FINTRAC_URL:         'https://www10.fintrac-canafe.gc.ca/msb-esm/public/msb-search',
} as const;

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const REWARDS = {
  POINTS_CREDIT_LINE_PAYMENT: 100,
  POINTS_CREDIT_BUILDER_PAYMENT: 50,
  POINTS_BALANCE_TRANSFER: 200,
  POINTS_EXTERNAL_CARD_PAYMENT: 25,
  POINTS_BUDGET_REVIEW: 10,
  POINTS_AI_ACTION_COMPLETE: 30,
  POINTS_LOW_UTILIZATION: 20,
  POINTS_REVIEW_ONE_TIME: 500,
  /** Points needed to unlock credit line application (Credit Builder path) */
  POINTS_GRADUATION_THRESHOLD: 2000,
} as const;

// ─── Trial Reminder Schedule ─────────────────────────────────────────────────
/** Days into trial when reminder notifications fire */
export const TRIAL_REMINDER_DAYS = [75, 83, 90] as const;

// ─── Manual Review ───────────────────────────────────────────────────────────
export const MANUAL_REVIEW = {
  MAX_HOURS:          48,
  PROGRESS_UPDATE_HOURS: 24,
} as const;

// ─── App Meta ────────────────────────────────────────────────────────────────
export const APP = {
  NAME:    'Buffer',
  DOMAIN:  'mybuffer.ca',
  SUPPORT: 'hello@mybuffer.ca',
  PHONE:   '+18779091559',
  ADDRESS: '1155 Pender St, Vancouver, BC, Canada',
} as const;

// ─── ID Types ────────────────────────────────────────────────────────────────
export const ID_TYPES = [
  { value: 'drivers_licence', label: "Driver's Licence" },
  { value: 'passport',        label: 'Passport' },
] as const;

export type IdType = typeof ID_TYPES[number]['value'];

// ─── Payoff Strategies ───────────────────────────────────────────────────────
export const PAYOFF_STRATEGIES = [
  {
    value:       'avalanche',
    label:       'Avalanche',
    description: 'Pay the highest-interest card first. Saves the most money in total interest paid.',
  },
  {
    value:       'snowball',
    label:       'Snowball',
    description: 'Pay the smallest balance first. Builds momentum with quick wins.',
  },
] as const;

export type PayoffStrategy = typeof PAYOFF_STRATEGIES[number]['value'];
