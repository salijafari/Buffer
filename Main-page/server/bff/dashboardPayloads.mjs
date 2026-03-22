import { Prisma } from "@prisma/client";
import {
  buildAggregateTimeline,
  estimatedAprFromCreditScore,
  serializeTimeline,
} from "./debtSimulation.mjs";

function institutionColor(name) {
  const s = String(name || "Bank");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 52%, 40%)`;
}

function numFromDecimal(d) {
  if (d == null) return 0;
  if (d instanceof Prisma.Decimal) return d.toNumber();
  return Number(d);
}

/**
 * Build payoff cards + timeline for dashboard APIs.
 */
export async function buildDashboardOverviewPayload(prisma, profile) {
  const profileId = profile.id;
  const creditScore = profile.creditScore ?? null;
  const fallbackApr = estimatedAprFromCreditScore(creditScore);

  const liabilities = await prisma.creditCardLiability.findMany({
    where: { profileId },
    include: {
      plaidAccount: {
        include: { plaidItem: true },
      },
    },
    orderBy: { fetchedAt: "desc" },
  });

  const cards = [];

  for (const liab of liabilities) {
    const pa = liab.plaidAccount;
    if (!pa) continue;
    const bal = numFromDecimal(liab.currentBalance ?? pa.currentBalance ?? 0);
    const limit = numFromDecimal(liab.creditLimit ?? pa.creditLimit ?? 0);
    const aprVal = liab.purchaseApr != null ? numFromDecimal(liab.purchaseApr) : fallbackApr;
    const institution = pa.plaidItem?.institutionName ?? pa.institutionId ?? "";
    cards.push({
      id: pa.id,
      name: pa.name || pa.officialName || "Credit card",
      last4: pa.mask || "••••",
      balance: bal,
      apr: liab.purchaseApr != null ? aprVal : null,
      limit: limit || 0,
      institution,
      color: institutionColor(institution || pa.name || "card"),
    });
  }

  /** Credit Plaid accounts without liability row yet */
  if (cards.length === 0) {
    const creditAccounts = await prisma.plaidAccount.findMany({
      where: {
        profileId,
        OR: [
          { type: { equals: "credit", mode: "insensitive" } },
          { subtype: { contains: "credit", mode: "insensitive" } },
        ],
      },
      include: { plaidItem: true },
    });
    for (const pa of creditAccounts) {
      const bal = numFromDecimal(pa.currentBalance ?? 0);
      const limit = numFromDecimal(pa.creditLimit ?? 0);
      const institution = pa.plaidItem?.institutionName ?? pa.institutionId ?? "";
      cards.push({
        id: pa.id,
        name: pa.name || pa.officialName || "Credit card",
        last4: pa.mask || "••••",
        balance: bal,
        apr: null,
        limit: limit || 0,
        institution,
        color: institutionColor(institution || pa.name || "card"),
      });
    }
  }

  const connected = profile.plaidConnectionStatus === "connected";
  const syncPending = connected && cards.length === 0;

  if (syncPending) {
    return {
      cards: [],
      timeline: null,
      aiInsight: null,
      meta: {
        source: "empty",
        aprFallbackApplied: false,
        syncPending: true,
      },
    };
  }

  const simCards = cards.map((c) => ({
    balance: Math.max(0, c.balance),
    apr: c.apr ?? fallbackApr,
  }));

  const annualIncome = profile.annualPreTaxIncome != null ? Number(profile.annualPreTaxIncome) : null;
  const payMin = simCards.reduce((s, c) => {
    const rate = c.apr ?? 0.1999;
    const interest = (c.balance * rate) / 12;
    return s + Math.max(10, c.balance * 0.02 + interest);
  }, 0);
  const currentPace =
    annualIncome != null && annualIncome > 0
      ? Math.round(Math.max(payMin * 1.35, (annualIncome / 12) * 0.08))
      : Math.round(payMin * 1.35);

  const timeline = buildAggregateTimeline(simCards, {
    currentPacePayment: currentPace,
    bufferPayment: undefined,
  });

  const serialized = serializeTimeline(timeline);

  /** Simple insight: highest utilization */
  let aiInsight = null;
  if (cards.length) {
    const scored = cards
      .map((c) => ({
        c,
        u: c.limit > 0 ? c.balance / c.limit : 0,
      }))
      .sort((a, b) => b.u - a.u);
    const top = scored[0];
    if (top && top.u >= 0.5 && top.c.limit > 0) {
      aiInsight = `${top.c.name} is at ${Math.round(top.u * 100)}% utilization — paying it down or moving balance could help your score.`;
    }
  }

  return {
    cards,
    timeline: serialized,
    aiInsight,
    meta: {
      source: cards.length ? "plaid" : "empty",
      aprFallbackApplied: timeline.aprFallbackApplied,
      syncPending: false,
    },
  };
}

export async function buildTransactionSummary(prisma, profileId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const txs = await prisma.plaidTransaction.findMany({
    where: {
      profileId,
      date: { gte: since },
      pending: false,
    },
    select: {
      amount: true,
      categoryPrimary: true,
      merchantName: true,
      name: true,
    },
  });

  const byCategory = new Map();
  let spendTotal = 0;
  let incomeTotal = 0;

  for (const t of txs) {
    const amt = numFromDecimal(t.amount);
    const cat = t.categoryPrimary || "OTHER";
    /** Plaid: positive = outflow on credit / depository */
    if (amt > 0) {
      spendTotal += amt;
      byCategory.set(cat, (byCategory.get(cat) || 0) + amt);
    } else if (amt < 0) {
      incomeTotal += -amt;
    }
  }

  const categories = [...byCategory.entries()]
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  return {
    days,
    spendTotal: Math.round(spendTotal * 100) / 100,
    incomeTotal: Math.round(incomeTotal * 100) / 100,
    categories,
  };
}

/**
 * Heuristic monthly income from categorized inflows (last 90 days / 3).
 */
export async function estimateIncomeFromTransactions(prisma, profileId) {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const txs = await prisma.plaidTransaction.findMany({
    where: {
      profileId,
      date: { gte: since },
      pending: false,
    },
    select: {
      date: true,
      amount: true,
      categoryPrimary: true,
      categoryDetailed: true,
      name: true,
      merchantName: true,
    },
  });

  let incomeSum = 0;
  let incomeMonths = new Set();

  for (const t of txs) {
    const amt = numFromDecimal(t.amount);
    if (amt >= 0) continue;
    const inflow = -amt;
    const cat = (t.categoryPrimary || "").toUpperCase();
    const detailed = (t.categoryDetailed || "").toUpperCase();
    const isIncome =
      cat.includes("INCOME") ||
      detailed.includes("INCOME") ||
      detailed.includes("PAYROLL") ||
      /payroll|salary|direct dep/i.test(t.name || "") ||
      /payroll|salary|direct dep/i.test(t.merchantName || "");

    if (!isIncome) continue;

    incomeSum += inflow;
    const ymd = t.date instanceof Date ? t.date.toISOString().slice(0, 7) : "";
    if (ymd) incomeMonths.add(ymd);
  }

  const months = Math.max(1, incomeMonths.size);
  const monthlyEstimate = Math.round((incomeSum / months) * 100) / 100;

  return {
    windowDays: 90,
    monthsWithIncomeLabels: months,
    estimatedMonthlyIncome: monthlyEstimate,
    note: "Heuristic from Plaid categories; not tax advice.",
  };
}
