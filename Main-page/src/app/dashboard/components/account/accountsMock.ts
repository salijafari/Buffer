/** Illustrative “paid down” cards for Accounts page (replace with ledger API later). */
export type PaidDownCardRow = {
  name: string;
  mask: string;
  originalBalance: number;
};

export const ACCOUNTS_PAID_DOWN_CARDS: PaidDownCardRow[] = [
  { name: "Visa", mask: "8841", originalBalance: 3_200 },
  { name: "Mastercard", mask: "2209", originalBalance: 4_100 },
  { name: "Amex", mask: "7710", originalBalance: 1_850 },
];
