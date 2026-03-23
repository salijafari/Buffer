/**
 * Mock overview metrics (replace with ledger / Plaid / bureau APIs later).
 */
export const OVERVIEW_MOCK = {
  payoff: {
    originalAmount: 9_500,
    totalPaid: 2_300,
    remaining: 7_200,
    /** 0–100 */
    completionPct: 24,
  },
  metrics: {
    interestSavedThisMonth: 89,
    interestSavedCumulative: 412,
    availableCredit: 2_800,
    /** Monthly “breathing room” — framed as Card 1 savings */
    breathingRoomMonthly: 140,
  },
  payment: {
    currentBalance: 7_200,
    nextPaymentAmount: 245,
    /** April 12 (year from mock context) */
    nextPaymentDateIso: "2026-04-12",
    autopayOn: true,
    bankLabel: "TD Chequing",
    bankMask: "1234",
  },
  creditHealth: {
    utilBeforePct: 78,
    utilAfterPct: 41,
    onTimeStreakMonths: 4,
    scoreTrendPts: 22,
  },
  /** Plaid last sync label */
  accountsUpdatedLabel: "Today 9:42 AM",
} as const;

export type OverviewConnectedAccountRow =
  | {
      kind: "bank";
      name: string;
      mask: string;
    }
  | {
      kind: "card_paid";
      name: string;
      mask: string;
    };

/** Illustrative connected accounts list (matches Stitch HTML mock). */
export const OVERVIEW_MOCK_ACCOUNTS: OverviewConnectedAccountRow[] = [
  { kind: "bank", name: "TD Chequing", mask: "1234" },
  { kind: "card_paid", name: "Visa", mask: "8841" },
  { kind: "card_paid", name: "Mastercard", mask: "2209" },
  { kind: "card_paid", name: "Amex", mask: "7710" },
];
