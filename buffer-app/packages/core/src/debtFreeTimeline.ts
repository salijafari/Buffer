/**
 * Buffer — Debt-Free Timeline Algorithm
 * /packages/core/src/debtFreeTimeline.ts
 *
 * Build this module first. Unit-test it before integrating into any UI.
 * 100% branch coverage required before merge.
 *
 * Key design choices:
 * - Pure functions, no side effects, no DOM/RN dependencies.
 * - All monetary values in CAD cents (integer) internally to avoid
 *   floating-point accumulation errors across 1,200 simulation steps.
 *   Public-facing inputs/outputs remain in CAD dollars (number).
 * - Simulation cap: 1,200 months (100 years) — prevents infinite loops.
 * - Missing APR fallback: 0.2114 (Bank of Canada average card rate).
 */

import { FINANCE } from './constants.js';

// ─── Public Types ────────────────────────────────────────────────────────────

export interface DebtInput {
  /** CAD — outstanding balance per card, from Plaid Liabilities */
  cardBalances: number[];
  /**
   * Decimal APR per card (e.g. 0.2114 = 21.14%), from Plaid Liabilities.
   * null / undefined / 0 → fallback applied, footnote flag set.
   */
  cardAPRs: (number | null | undefined)[];
  /** CAD — average of last 3 months payroll deposits (Plaid Income) */
  monthlyIncome: number;
  /** CAD — essential spending 90-day avg (Plaid Transactions) */
  monthlyEssentials: number;
  /**
   * CAD — existing monthly debt-payment avg from Plaid (trailing 90 days).
   * Used to calculate true disposable income.
   */
  monthlyDebtPayments: number;
  /** Decimal — user's approved Buffer APR (0.14–0.18) */
  bufferAPR: number;
  /**
   * Number of days of Plaid transaction history available.
   * < 30 → Future 2 is skipped; income × 0.20 used as recommended default.
   */
  plaidHistoryDays?: number;
}

export interface SimulationResult {
  /** Total months until balance reaches zero */
  monthsToZero: number;
  /** Total interest charged over the life of the debt (CAD) */
  totalInterest: number;
  /** Total amount paid (principal + interest) (CAD) */
  totalPaid: number;
  /** Balance remaining at end of each month (index 0 = end of month 1) */
  balanceArray: number[];
  /** Calendar date when debt reaches zero */
  debtFreeDate: Date;
  /** Monthly payment used (for Future 1 this is the *starting* minimum) */
  monthlyPayment: number;
}

export interface TimelineOutput {
  /** Minimum-payments-only projection */
  future1: SimulationResult;
  /**
   * Current-pace projection (actual Plaid payment average).
   * null when plaidHistoryDays < 30.
   */
  future2: SimulationResult | null;
  /**
   * Buffer-recommended projection.
   * null when insufficientIncome is true.
   */
  future3: SimulationResult | null;
  /** Recommended monthly payment (CAD) */
  recommendedPayment: number;
  /**
   * Interest saved vs. minimum-payment path (future1.totalInterest − future3.totalInterest).
   * 0 when future3 is null.
   */
  interestSavings: number;
  /**
   * Years saved vs. minimum-payment path.
   * 0 when future3 is null.
   */
  yearsSaved: number;
  /**
   * True when disposable income is less than the sum of all minimum payments.
   * When true, future3 is null and the UI routes to budgeting first.
   */
  insufficientIncome: boolean;
  /**
   * True when at least one card's APR was null/0 and the fallback was applied.
   * UI must show footnote: "We used the average Canadian card rate…"
   */
  aprFallbackApplied: boolean;
  /**
   * True when plaidHistoryDays < 30; future2 is null and income × 0.20
   * is used as the default recommended payment.
   */
  limitedHistory: boolean;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

const MAX_MONTHS  = 1200;
const CENTS       = 100; // multiply to work in cents; divide on output

function toCents(dollars: number): number {
  return Math.round(dollars * CENTS);
}

function toDollars(cents: number): number {
  return cents / CENTS;
}

/**
 * Sanitise an APR value.
 * Returns [sanitisedAPR, fallbackApplied]
 */
function sanitiseAPR(apr: number | null | undefined): [number, boolean] {
  if (apr == null || apr <= 0 || !isFinite(apr)) {
    return [FINANCE.FALLBACK_APR, true];
  }
  return [apr, false];
}

/**
 * Canadian bank minimum payment formula (mandatory, per spec):
 *   max(balance × 0.02 + monthly_interest, $10)
 * Recalculated every month as balance falls.
 */
function calcMinPaymentCents(balanceCents: number, monthlyRateCents: number): number {
  const flat      = Math.round(balanceCents * FINANCE.MIN_PAYMENT_PCT);
  const withInterest = flat + monthlyRateCents;
  return Math.max(withInterest, toCents(FINANCE.MIN_PAYMENT_FLOOR));
}

/**
 * Adds the given number of months to today's date.
 */
function addMonths(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setDate(1); // normalise to first of month
  return d;
}

// ─── Core simulation loop ────────────────────────────────────────────────────

type SimMode =
  | { type: 'minPayment' }
  | { type: 'fixedPayment'; paymentDollars: number };

/**
 * Run one simulation lane from the given total balance and blended APR.
 * All internal arithmetic in integer cents.
 */
function simulate(
  totalBalanceDollars: number,
  blendedAPR:          number,
  mode:                SimMode,
): SimulationResult {
  let balanceCents    = toCents(totalBalanceDollars);
  let totalInterestCents = 0;
  let totalPaidCents     = 0;
  let months             = 0;
  const balanceArray: number[] = [];
  const monthlyRate = blendedAPR / 12;

  let startingMinPayment = 0;

  while (balanceCents > 0 && months < MAX_MONTHS) {
    const interestCents = Math.round(balanceCents * monthlyRate);

    let paymentCents: number;
    if (mode.type === 'minPayment') {
      paymentCents = calcMinPaymentCents(balanceCents, interestCents);
      if (months === 0) startingMinPayment = paymentCents;
    } else {
      paymentCents = toCents(mode.paymentDollars);
    }

    // Can't pay more than what's owed
    const maxPayable   = balanceCents + interestCents;
    const actualPaid   = Math.min(paymentCents, maxPayable);

    balanceCents       = maxPayable - actualPaid;
    totalInterestCents += interestCents;
    totalPaidCents     += actualPaid;
    months++;

    balanceArray.push(toDollars(Math.max(0, balanceCents)));

    // Safety: if fixed payment doesn't cover interest, exit early
    if (mode.type === 'fixedPayment' && actualPaid <= interestCents && balanceCents > 0) {
      // Payment doesn't reduce principal — would never reach zero
      // Cap at MAX_MONTHS (already handled by while condition)
      break;
    }
  }

  return {
    monthsToZero:  months,
    totalInterest: toDollars(totalInterestCents),
    totalPaid:     toDollars(totalPaidCents),
    balanceArray,
    debtFreeDate:  addMonths(months),
    monthlyPayment:
      mode.type === 'minPayment'
        ? toDollars(startingMinPayment)
        : mode.paymentDollars,
  };
}

// ─── Blended APR ─────────────────────────────────────────────────────────────

/**
 * Compute a balance-weighted blended APR across all cards.
 * Cards with zero or missing APRs are replaced with FALLBACK_APR.
 */
function blendedAPR(
  balances:          number[],
  aprs:              (number | null | undefined)[],
): { apr: number; fallbackApplied: boolean } {
  const total      = balances.reduce((s, b) => s + b, 0);
  if (total === 0) return { apr: FINANCE.FALLBACK_APR, fallbackApplied: false };

  let weightedSum    = 0;
  let fallbackApplied = false;

  for (let i = 0; i < balances.length; i++) {
    const bal = balances[i] ?? 0;
    const [apr, used_fallback] = sanitiseAPR(aprs[i]);
    if (used_fallback) fallbackApplied = true;
    weightedSum += (bal / total) * apr;
  }

  return { apr: weightedSum, fallbackApplied };
}

// ─── Sum of minimum payments ─────────────────────────────────────────────────

function sumMinPayments(balances: number[], aprs: (number | null | undefined)[]): number {
  let total = 0;
  for (let i = 0; i < balances.length; i++) {
    const bal        = balances[i] ?? 0;
    const [apr]      = sanitiseAPR(aprs[i]);
    const monthlyRate = apr / 12;
    const interestCents = Math.round(toCents(bal) * monthlyRate);
    total += toDollars(calcMinPaymentCents(toCents(bal), interestCents));
  }
  return total;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Calculate the three debt-free timeline projections.
 *
 * @example
 * const result = calcDebtFreeTimeline({
 *   cardBalances:       [8000, 3500],
 *   cardAPRs:           [0.2114, 0.1999],
 *   monthlyIncome:      5000,
 *   monthlyEssentials:  2800,
 *   monthlyDebtPayments:450,
 *   bufferAPR:          0.15,
 *   plaidHistoryDays:   90,
 * });
 */
export function calcDebtFreeTimeline(input: DebtInput): TimelineOutput {
  const {
    cardBalances,
    cardAPRs,
    monthlyIncome,
    monthlyEssentials,
    monthlyDebtPayments,
    bufferAPR,
    plaidHistoryDays = 90,
  } = input;

  const totalBalance     = cardBalances.reduce((s, b) => s + b, 0);
  const limitedHistory   = plaidHistoryDays < FINANCE.MIN_HISTORY_FOR_FUTURE2;
  const { apr: cardBlendedAPR, fallbackApplied: aprFallbackApplied } =
    blendedAPR(cardBalances, cardAPRs);

  // ── Future 1: minimum payments at card APRs ──────────────────────────────
  const future1 = simulate(totalBalance, cardBlendedAPR, { type: 'minPayment' });

  // ── Future 2: current payment pace ──────────────────────────────────────
  let future2: SimulationResult | null = null;
  if (!limitedHistory && monthlyDebtPayments > 0) {
    future2 = simulate(totalBalance, cardBlendedAPR, {
      type:            'fixedPayment',
      paymentDollars:  monthlyDebtPayments,
    });
  }

  // ── Recommended payment calculation ────────────────────────────────────
  const bufferReserve      = monthlyIncome * FINANCE.INCOME_RESERVE_PCT;
  const disposable         = monthlyIncome - monthlyEssentials - monthlyDebtPayments - bufferReserve;
  const minPaymentsSum     = sumMinPayments(cardBalances, cardAPRs);
  const insufficientIncome = disposable < minPaymentsSum;

  let recommendedPayment = 0;
  let future3: SimulationResult | null = null;

  if (!insufficientIncome) {
    const uncapped = disposable;
    const cap      = totalBalance / FINANCE.RECOMMENDED_PAYMENT_MONTHS;
    recommendedPayment = Math.max(
      minPaymentsSum,
      Math.min(uncapped, cap),
    );
    // If limited history, override with income × 0.20
    if (limitedHistory) {
      recommendedPayment = Math.max(minPaymentsSum, monthlyIncome * 0.20);
    }

    future3 = simulate(totalBalance, bufferAPR, {
      type:            'fixedPayment',
      paymentDollars:  recommendedPayment,
    });
  }

  const interestSavings =
    future3 != null
      ? Math.max(0, future1.totalInterest - future3.totalInterest)
      : 0;

  const yearsSaved =
    future3 != null
      ? Math.max(0, (future1.monthsToZero - future3.monthsToZero) / 12)
      : 0;

  return {
    future1,
    future2,
    future3,
    recommendedPayment,
    interestSavings,
    yearsSaved,
    insufficientIncome,
    aprFallbackApplied,
    limitedHistory,
  };
}

/**
 * Recalculate only Future 3 for the payment slider — avoids re-running
 * Future 1 and Future 2 on every slider input event.
 */
export function calcFuture3Only(
  totalBalance:   number,
  bufferAPR:      number,
  paymentDollars: number,
): SimulationResult {
  return simulate(totalBalance, bufferAPR, {
    type: 'fixedPayment',
    paymentDollars,
  });
}

/**
 * Compute the slider bounds for the payment adjustment slider.
 */
export function calcSliderBounds(input: DebtInput): {
  min:     number;
  max:     number;
  step:    number;
  default: number;
} {
  const minPaymentsSum = sumMinPayments(input.cardBalances, input.cardAPRs);
  const bufferReserve  = input.monthlyIncome * FINANCE.INCOME_RESERVE_PCT;
  const disposable     = input.monthlyIncome - input.monthlyEssentials
                         - input.monthlyDebtPayments - bufferReserve;
  const cap            = (input.cardBalances.reduce((s, b) => s + b, 0))
                         / FINANCE.RECOMMENDED_PAYMENT_MONTHS;

  const defaultPayment = Math.max(minPaymentsSum, Math.min(disposable, cap));

  return {
    min:     Math.ceil(minPaymentsSum / 10) * 10,   // round up to nearest $10
    max:     Math.floor(disposable / 10) * 10,       // round down to nearest $10
    step:    10,
    default: Math.round(defaultPayment / 10) * 10,
  };
}
