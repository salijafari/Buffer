/** Past payments list (replace with ledger API). */
export type PaymentHistoryRow = {
  dateIso: string;
  amount: number;
  description: string;
};

export const PAYMENTS_HISTORY_MOCK: PaymentHistoryRow[] = [
  { dateIso: "2026-03-12", amount: 245, description: "Standard Monthly Payment" },
  { dateIso: "2026-02-12", amount: 245, description: "Standard Monthly Payment" },
  { dateIso: "2026-01-12", amount: 245, description: "Standard Monthly Payment" },
];
