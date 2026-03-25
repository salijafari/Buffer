/** Monthly statement rows (replace with API). */
export type StatementRow = {
  id: string;
  /** Display e.g. "Mar 2026" */
  periodLabel: string;
  amountDue: number;
  status: "paid" | "due";
};

export const STATEMENTS_LIST_MOCK: StatementRow[] = [
  { id: "2026-03", periodLabel: "Mar 2026", amountDue: 245, status: "paid" },
  { id: "2026-02", periodLabel: "Feb 2026", amountDue: 245, status: "paid" },
  { id: "2026-01", periodLabel: "Jan 2026", amountDue: 245, status: "paid" },
  { id: "2025-12", periodLabel: "Dec 2025", amountDue: 245, status: "paid" },
];

/** Illustrative YTD total paid (mock). */
export const STATEMENTS_YTD_PAID = 980;

export const PAYMENTS_STATEMENTS_PATH = "/dashboard/payoff/statements";
