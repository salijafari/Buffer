/**
 * Server-side payoff simulation (mirrors dashboard spec / dashboardFormulas.ts).
 */

export const FINANCE = {
  BUFFER_APR_MIDPOINT: 0.155,
  MIN_PAYMENT_PCT: 0.02,
  MIN_PAYMENT_FLOOR: 10,
};

export function monthlyInterestCost(balance, aprAnnual) {
  if (balance <= 0 || aprAnnual < 0) return 0;
  return (balance * aprAnnual) / 12;
}

export function canadianMinimumMonthlyPayment(balance, aprAnnual) {
  if (balance <= 0) return 0;
  const interest = monthlyInterestCost(balance, aprAnnual);
  return Math.max(FINANCE.MIN_PAYMENT_FLOOR, balance * FINANCE.MIN_PAYMENT_PCT + interest);
}

export function estimatedAprFromCreditScore(score) {
  if (score == null || !Number.isFinite(Number(score))) return 0.22;
  const s = Number(score);
  if (s < 580) return 0.26;
  if (s < 670) return 0.22;
  if (s < 740) return 0.18;
  return 0.15;
}

export function simulateAggregatePayoff(initialBalance, aprAnnual, monthlyPayment, maxMonths = 600) {
  const rate = aprAnnual / 12;
  const balanceArray = [];
  let bal = Math.max(0, initialBalance);
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (bal > 0.01 && months < maxMonths) {
    const interest = bal * rate;
    const paid = Math.min(monthlyPayment, bal + interest);
    if (paid <= interest + 1e-6 && bal > 0.01) {
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

export function weightedAvgApr(cards) {
  const total = cards.reduce((s, c) => s + Math.max(0, c.balance), 0);
  if (total <= 0) return 0.1999;
  const w = cards.reduce((s, c) => s + Math.max(0, c.balance) * (c.apr ?? 0.1999), 0);
  return w / total;
}

export function totalMinimumPayments(cards) {
  return cards.reduce((s, c) => s + canadianMinimumMonthlyPayment(Math.max(0, c.balance), c.apr ?? 0.1999), 0);
}

/**
 * Build three-scenario timeline from normalized card rows { balance, apr }.
 */
export function buildAggregateTimeline(cards, options = {}) {
  const totalBal = cards.reduce((s, c) => s + Math.max(0, c.balance), 0);
  if (totalBal <= 0) {
    const now = new Date();
    const empty = {
      monthsToZero: 0,
      totalInterest: 0,
      totalPaid: 0,
      balanceArray: [],
      debtFreeDate: now,
      monthlyPayment: 0,
    };
    return {
      future1: empty,
      future2: empty,
      future3: empty,
      recommendedPayment: 0,
      interestSavings: 0,
      yearsSaved: 0,
    };
  }

  const wApr = weightedAvgApr(cards);
  const payMin = totalMinimumPayments(cards);
  const payCurrent = Math.max(payMin, options.currentPacePayment ?? Math.round(payMin * 1.35));
  const payBuffer = Math.max(payCurrent, options.bufferPayment ?? Math.round(Math.min(totalBal * 0.06, payCurrent * 1.4)));

  const future1 = simulateAggregatePayoff(totalBal, wApr, payMin);
  const future2 = simulateAggregatePayoff(totalBal, wApr, payCurrent);
  const future3 = simulateAggregatePayoff(totalBal, FINANCE.BUFFER_APR_MIDPOINT, payBuffer);

  const interestSavings = Math.max(0, future1.totalInterest - future3.totalInterest);
  const monthsSaved = Math.max(0, future1.monthsToZero - future3.monthsToZero);
  const yearsSaved = monthsSaved / 12;

  return {
    future1,
    future2,
    future3,
    recommendedPayment: payBuffer,
    interestSavings,
    yearsSaved,
    insufficientIncome: false,
    aprFallbackApplied: cards.some((c) => c.apr == null),
    limitedHistory: false,
  };
}

export function serializeSimulation(sim) {
  return {
    monthsToZero: sim.monthsToZero,
    totalInterest: sim.totalInterest,
    totalPaid: sim.totalPaid,
    balanceArray: sim.balanceArray,
    debtFreeDate: sim.debtFreeDate.toISOString(),
    monthlyPayment: sim.monthlyPayment,
  };
}

export function serializeTimeline(t) {
  return {
    future1: serializeSimulation(t.future1),
    future2: serializeSimulation(t.future2),
    future3: serializeSimulation(t.future3),
    recommendedPayment: t.recommendedPayment,
    interestSavings: t.interestSavings,
    yearsSaved: t.yearsSaved,
    insufficientIncome: t.insufficientIncome,
    aprFallbackApplied: t.aprFallbackApplied,
    limitedHistory: t.limitedHistory,
  };
}
