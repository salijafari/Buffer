/**
 * BUFFER dashboard formulas (spec). Pure functions — safe for client.
 * @see FINANCE in ./finance.ts for shared constants
 */

import { FINANCE } from "./finance";

/** Monthly interest: (balance × APR) / 12 */
export function monthlyInterestCost(balance: number, aprAnnual: number): number {
  if (balance <= 0 || aprAnnual < 0) return 0;
  return (balance * aprAnnual) / 12;
}

/**
 * Canadian-style minimum payment (simplified aggregate):
 * max($10, (balance × 0.02) + monthly_interest)
 */
export function canadianMinimumMonthlyPayment(balance: number, aprAnnual: number): number {
  if (balance <= 0) return 0;
  const interest = monthlyInterestCost(balance, aprAnnual);
  return Math.max(FINANCE.MIN_PAYMENT_FLOOR, balance * FINANCE.MIN_PAYMENT_PCT + interest);
}

/** Approximate national average APR by credit score (illustrative, pre-connection). */
export function estimatedAprFromCreditScore(score: number | null | undefined): number {
  if (score == null || !Number.isFinite(score)) return 0.22;
  if (score < 580) return 0.26;
  if (score < 670) return 0.22;
  if (score < 740) return 0.18;
  return 0.15;
}

export type PayoffSimulation = {
  monthsToZero: number;
  totalInterest: number;
  totalPaid: number;
  balanceArray: number[];
  debtFreeDate: Date;
  monthlyPayment: number;
};

/**
 * Simulate paying down a single balance with fixed monthly payment.
 * Stops if payment doesn't cover interest (infinite debt).
 */
export function simulateAggregatePayoff(
  initialBalance: number,
  aprAnnual: number,
  monthlyPayment: number,
  maxMonths = 600,
): PayoffSimulation {
  const rate = aprAnnual / 12;
  const balanceArray: number[] = [];
  let bal = Math.max(0, initialBalance);
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (bal > 0.01 && months < maxMonths) {
    const interest = bal * rate;
    const paid = Math.min(monthlyPayment, bal + interest);
    if (paid <= interest + 1e-6 && bal > 0.01) {
      // Cannot amortize
      months = maxMonths;
      break;
    }
    totalInterest += interest;
    totalPaid += paid;
    bal = bal + interest - paid;
    balanceArray.push(Math.max(0, bal));
    months++;
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  return {
    monthsToZero: months,
    totalInterest,
    totalPaid,
    balanceArray,
    debtFreeDate,
    monthlyPayment,
  };
}

/** Interest savings vs original APR at same payment: monthly delta × months is wrong; use totalInterest delta from two sims. */
export function interestSavingsVsApr(
  balance: number,
  aprOriginal: number,
  aprBuffer: number,
  monthlyPayment: number,
): { saved: number; monthsDelta: number } {
  const a = simulateAggregatePayoff(balance, aprOriginal, monthlyPayment);
  const b = simulateAggregatePayoff(balance, aprBuffer, monthlyPayment);
  return {
    saved: Math.max(0, a.totalInterest - b.totalInterest),
    monthsDelta: Math.max(0, a.monthsToZero - b.monthsToZero),
  };
}

/** Affordable payment range from annual income (10–15% of monthly income). */
export function affordablePaymentRangeCad(annualPreTaxIncome: number): { low: number; high: number } {
  const monthly = annualPreTaxIncome / 12;
  return {
    low: Math.round(monthly * 0.1),
    high: Math.round(monthly * 0.15),
  };
}

export function utilizationPct(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((balance / limit) * 100));
}
