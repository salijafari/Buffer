/** Shown in place of currency, counts, and percentages when Plaid is not connected. */
export const FINANCIAL_MASK = "**";

export function displayMoney(connected: boolean, format: () => string): string {
  return connected ? format() : FINANCIAL_MASK;
}

export function displayText(connected: boolean, value: string): string {
  return connected ? value : FINANCIAL_MASK;
}

export function displayInt(connected: boolean, n: number): string {
  return connected ? String(n) : FINANCIAL_MASK;
}
