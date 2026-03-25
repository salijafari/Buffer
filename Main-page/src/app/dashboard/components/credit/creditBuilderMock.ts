import { OVERVIEW_MOCK } from "../home/overview/overviewMock";

/** Aligns with overview credit health mock; swap for live APIs later. */
export const CREDIT_BUILDER_METRICS = {
  utilBeforePct: OVERVIEW_MOCK.creditHealth.utilBeforePct,
  utilAfterPct: OVERVIEW_MOCK.creditHealth.utilAfterPct,
  onTimeStreakMonths: OVERVIEW_MOCK.creditHealth.onTimeStreakMonths,
  scoreTrendPts: OVERVIEW_MOCK.creditHealth.scoreTrendPts,
} as const;

export const HOW_BUFFER_HELPS: { icon: string; text: string }[] = [
  { icon: "credit_card", text: "Pays down revolving credit card balances" },
  { icon: "compare_arrows", text: "Reduces utilization pressure" },
  { icon: "event_repeat", text: "Replaces multiple due dates with one bill" },
  { icon: "event_available", text: "Supports more consistent on-time repayment behavior" },
];
