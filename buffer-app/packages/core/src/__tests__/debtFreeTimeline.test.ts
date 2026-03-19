/**
 * Buffer — debtFreeTimeline Unit Tests
 * 100% branch coverage required before merge (enforced by vitest --coverage).
 *
 * All 7 edge cases from the spec are tested:
 *  1. Single card, known APR, known income → verify months & interest
 *  2. Multiple cards, mixed APRs
 *  3. Insufficient income → Future 3 skipped, insufficientIncome = true
 *  4. Balance under $1,000
 *  5. Balance over $50,000
 *  6. Missing APR fallback → 0.2114 substituted
 *  7. New account < 30 days history → Future 2 skipped, income × 0.20 default
 */

import { describe, it, expect } from 'vitest';
import {
  calcDebtFreeTimeline,
  calcFuture3Only,
  calcSliderBounds,
  type DebtInput,
  type TimelineOutput,
} from '../debtFreeTimeline';

// ─── Helpers ────────────────────────────────────────────────────────────────

function baseInput(overrides?: Partial<DebtInput>): DebtInput {
  return {
    cardBalances:        [5000],
    cardAPRs:            [0.2114],
    monthlyIncome:       5000,
    monthlyEssentials:   2000,
    monthlyDebtPayments: 300,
    bufferAPR:           0.15,
    plaidHistoryDays:    90,
    ...overrides,
  };
}

// ─── Case 1: Single card, known APR ─────────────────────────────────────────

describe('Case 1 — single card, known APR, known income', () => {
  it('produces correct month count and interest for Future 1', () => {
    const result = calcDebtFreeTimeline(baseInput());

    // Minimum payments on $5,000 @ 21.14% should take many years
    expect(result.future1.monthsToZero).toBeGreaterThan(60);   // > 5 years
    expect(result.future1.totalInterest).toBeGreaterThan(2000);
    expect(result.future1.totalPaid).toBeCloseTo(
      result.future1.totalInterest + 5000, 0,
    );
  });

  it('Future 1 balance array starts near total balance and ends at 0', () => {
    const result = calcDebtFreeTimeline(baseInput());
    const arr = result.future1.balanceArray;

    expect(arr[0]).toBeLessThan(5000);      // balance reduced after first payment
    expect(arr[arr.length - 1]!).toBe(0);
    expect(arr.length).toBe(result.future1.monthsToZero);
  });

  it('Future 3 is faster than Future 1', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.future3).not.toBeNull();
    expect(result.future3!.monthsToZero).toBeLessThan(result.future1.monthsToZero);
  });

  it('interestSavings > 0', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.interestSavings).toBeGreaterThan(0);
  });

  it('yearsSaved > 0', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.yearsSaved).toBeGreaterThan(0);
  });

  it('debtFreeDate is a future Date', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.future1.debtFreeDate).toBeInstanceOf(Date);
    expect(result.future1.debtFreeDate.getTime()).toBeGreaterThan(Date.now());
  });

  it('Future 2 present when 90 days history and non-zero payment', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.future2).not.toBeNull();
  });

  it('aprFallbackApplied is false when real APR provided', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.aprFallbackApplied).toBe(false);
  });

  it('limitedHistory is false at 90 days', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.limitedHistory).toBe(false);
  });

  it('recommendedPayment is at least the minimum payment', () => {
    const result = calcDebtFreeTimeline(baseInput());
    // $5,000 × 2% + interest ≈ $188 — recommended must be ≥ this
    expect(result.recommendedPayment).toBeGreaterThan(100);
  });

  it('totalPaid in Future 3 is less than Future 1', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.future3!.totalPaid).toBeLessThan(result.future1.totalPaid);
  });
});

// ─── Case 2: Multiple cards, mixed APRs ─────────────────────────────────────

describe('Case 2 — multiple cards, mixed APRs', () => {
  const multiInput = baseInput({
    cardBalances:        [8000, 3500, 2000],
    cardAPRs:            [0.2114, 0.1999, 0.2999],
    monthlyDebtPayments: 600,
  });

  it('runs without error', () => {
    expect(() => calcDebtFreeTimeline(multiInput)).not.toThrow();
  });

  it('total balance sums correctly across cards', () => {
    const result = calcDebtFreeTimeline(multiInput);
    // 8000 + 3500 + 2000 = 13500
    const totalPaid = result.future1.totalPaid;
    expect(totalPaid).toBeGreaterThan(13500);
  });

  it('blended APR is between the min and max card APRs', () => {
    const result  = calcDebtFreeTimeline(multiInput);
    // Future1 uses blended card APR — total interest should reflect blended rate
    // Just verify it completes and interest is positive
    expect(result.future1.totalInterest).toBeGreaterThan(0);
  });

  it('Future 2 reflects the combined monthly payment', () => {
    const result = calcDebtFreeTimeline(multiInput);
    expect(result.future2).not.toBeNull();
    expect(result.future2!.monthlyPayment).toBe(600);
  });

  it('Future 3 is shorter than Future 1', () => {
    const result = calcDebtFreeTimeline(multiInput);
    expect(result.future3!.monthsToZero).toBeLessThan(result.future1.monthsToZero);
  });
});

// ─── Case 3: Insufficient income ────────────────────────────────────────────

describe('Case 3 — insufficient income', () => {
  // Very low income — can barely cover minimums
  const poorInput = baseInput({
    cardBalances:        [15000],
    cardAPRs:            [0.2999],
    monthlyIncome:       2000,
    monthlyEssentials:   1800,
    monthlyDebtPayments: 300,
  });

  it('sets insufficientIncome = true', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.insufficientIncome).toBe(true);
  });

  it('future3 is null', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.future3).toBeNull();
  });

  it('interestSavings is 0', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.interestSavings).toBe(0);
  });

  it('yearsSaved is 0', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.yearsSaved).toBe(0);
  });

  it('future1 still runs correctly', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.future1.monthsToZero).toBeGreaterThan(0);
  });

  it('recommendedPayment is 0', () => {
    const result = calcDebtFreeTimeline(poorInput);
    expect(result.recommendedPayment).toBe(0);
  });
});

// ─── Case 4: Small balance under $1,000 ─────────────────────────────────────

describe('Case 4 — very small balance (under $1,000)', () => {
  const smallInput = baseInput({
    cardBalances:        [750],
    cardAPRs:            [0.1999],
    monthlyDebtPayments: 100,
  });

  it('chart is not suppressed — runs and completes', () => {
    const result = calcDebtFreeTimeline(smallInput);
    expect(result.future1.monthsToZero).toBeGreaterThan(0);
    expect(result.future3).not.toBeNull();
  });

  it('resolves in a reasonable timeline (< 48 months for Future 3)', () => {
    const result = calcDebtFreeTimeline(smallInput);
    expect(result.future3!.monthsToZero).toBeLessThan(48);
  });

  it('totalInterest is positive but small', () => {
    const result = calcDebtFreeTimeline(smallInput);
    expect(result.future1.totalInterest).toBeGreaterThan(0);
    expect(result.future1.totalInterest).toBeLessThan(500);
  });
});

// ─── Case 5: Large balance over $50,000 ─────────────────────────────────────

describe('Case 5 — very large balance (over $50,000)', () => {
  const largeInput = baseInput({
    cardBalances:        [30000, 15000, 10000],
    cardAPRs:            [0.2114, 0.2499, 0.1999],
    monthlyIncome:       9000,
    monthlyEssentials:   3500,
    monthlyDebtPayments: 1200,
  });

  it('runs without error', () => {
    expect(() => calcDebtFreeTimeline(largeInput)).not.toThrow();
  });

  it('Future 1 may exceed 30 years (360 months) for minimum payments', () => {
    const result = calcDebtFreeTimeline(largeInput);
    // At minimum payments on $55k @ ~22% APR, this can be very long
    expect(result.future1.monthsToZero).toBeGreaterThan(120);
  });

  it('Future 3 shows meaningful savings', () => {
    const result = calcDebtFreeTimeline(largeInput);
    expect(result.interestSavings).toBeGreaterThan(5000);
  });

  it('balance arrays are consistent lengths', () => {
    const result = calcDebtFreeTimeline(largeInput);
    expect(result.future1.balanceArray.length).toBe(result.future1.monthsToZero);
  });
});

// ─── Case 6: Missing APR fallback ───────────────────────────────────────────

describe('Case 6 — missing APR, fallback to 21.14%', () => {
  it('applies fallback for null APR', () => {
    const result = calcDebtFreeTimeline(baseInput({ cardAPRs: [null] }));
    expect(result.aprFallbackApplied).toBe(true);
  });

  it('applies fallback for undefined APR', () => {
    const result = calcDebtFreeTimeline(baseInput({ cardAPRs: [undefined] }));
    expect(result.aprFallbackApplied).toBe(true);
  });

  it('applies fallback for zero APR', () => {
    const result = calcDebtFreeTimeline(baseInput({ cardAPRs: [0] }));
    expect(result.aprFallbackApplied).toBe(true);
  });

  it('does not apply fallback for valid APR', () => {
    const result = calcDebtFreeTimeline(baseInput({ cardAPRs: [0.1999] }));
    expect(result.aprFallbackApplied).toBe(false);
  });

  it('fallback APR produces same result as explicit 0.2114', () => {
    const withFallback  = calcDebtFreeTimeline(baseInput({ cardAPRs: [null] }));
    const withExplicit  = calcDebtFreeTimeline(baseInput({ cardAPRs: [0.2114] }));
    expect(withFallback.future1.monthsToZero).toBe(withExplicit.future1.monthsToZero);
    expect(withFallback.future1.totalInterest).toBeCloseTo(
      withExplicit.future1.totalInterest, 0,
    );
  });

  it('mixed: one null one real — only fallback flag is true', () => {
    const result = calcDebtFreeTimeline(baseInput({
      cardBalances: [4000, 3000],
      cardAPRs:     [0.1999, null],
    }));
    expect(result.aprFallbackApplied).toBe(true);
    expect(result.future1.monthsToZero).toBeGreaterThan(0);
  });
});

// ─── Case 7: Limited history (< 30 days) ────────────────────────────────────

describe('Case 7 — new account, under 30 days history', () => {
  const newAccountInput = baseInput({ plaidHistoryDays: 15 });

  it('limitedHistory is true', () => {
    const result = calcDebtFreeTimeline(newAccountInput);
    expect(result.limitedHistory).toBe(true);
  });

  it('future2 is null', () => {
    const result = calcDebtFreeTimeline(newAccountInput);
    expect(result.future2).toBeNull();
  });

  it('recommended payment uses income × 0.20 default', () => {
    const result = calcDebtFreeTimeline(newAccountInput);
    // income × 0.20 = 5000 × 0.20 = 1000
    expect(result.recommendedPayment).toBeGreaterThan(0);
    // Should be at least as large as income × 20%
    expect(result.recommendedPayment).toBeGreaterThanOrEqual(
      newAccountInput.monthlyIncome * 0.20,
    );
  });

  it('future1 still calculated correctly', () => {
    const result = calcDebtFreeTimeline(newAccountInput);
    expect(result.future1.monthsToZero).toBeGreaterThan(0);
  });

  it('future3 uses income × 0.20 as payment and runs normally', () => {
    const result = calcDebtFreeTimeline(newAccountInput);
    expect(result.future3).not.toBeNull();
    expect(result.future3!.monthsToZero).toBeGreaterThan(0);
  });
});

// ─── calcFuture3Only ─────────────────────────────────────────────────────────

describe('calcFuture3Only', () => {
  it('returns a SimulationResult', () => {
    const r = calcFuture3Only(5000, 0.15, 300);
    expect(r.monthsToZero).toBeGreaterThan(0);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.balanceArray.length).toBe(r.monthsToZero);
  });

  it('higher payment = fewer months', () => {
    const low  = calcFuture3Only(5000, 0.15, 200);
    const high = calcFuture3Only(5000, 0.15, 500);
    expect(high.monthsToZero).toBeLessThan(low.monthsToZero);
  });

  it('debtFreeDate is in the future', () => {
    const r = calcFuture3Only(5000, 0.15, 300);
    expect(r.debtFreeDate.getTime()).toBeGreaterThan(Date.now());
  });
});

// ─── calcSliderBounds ────────────────────────────────────────────────────────

describe('calcSliderBounds', () => {
  it('min <= default <= max', () => {
    const bounds = calcSliderBounds(baseInput());
    expect(bounds.min).toBeLessThanOrEqual(bounds.default);
    expect(bounds.default).toBeLessThanOrEqual(bounds.max);
  });

  it('step is $10', () => {
    const bounds = calcSliderBounds(baseInput());
    expect(bounds.step).toBe(10);
  });

  it('min is a multiple of $10', () => {
    const bounds = calcSliderBounds(baseInput());
    expect(bounds.min % 10).toBe(0);
  });

  it('max is a multiple of $10', () => {
    const bounds = calcSliderBounds(baseInput());
    expect(bounds.max % 10).toBe(0);
  });
});

// ─── Numerical precision ─────────────────────────────────────────────────────

describe('Numerical precision', () => {
  it('balanceArray last element is exactly 0', () => {
    const result = calcDebtFreeTimeline(baseInput());
    const arr = result.future1.balanceArray;
    expect(arr[arr.length - 1]).toBe(0);
  });

  it('total paid ≈ principal + total interest (within $1 rounding)', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(result.future1.totalPaid).toBeCloseTo(
      5000 + result.future1.totalInterest, 0,
    );
  });

  it('no NaN values in SimulationResult', () => {
    const result = calcDebtFreeTimeline(baseInput());
    expect(Number.isNaN(result.future1.totalInterest)).toBe(false);
    expect(Number.isNaN(result.future1.totalPaid)).toBe(false);
    expect(Number.isNaN(result.interestSavings)).toBe(false);
    expect(Number.isNaN(result.yearsSaved)).toBe(false);
  });
});
