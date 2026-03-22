import type { CardData, SimulationResult, TimelineOutput } from "@/app/dashboard/types/timeline";

export type DashboardOverviewMeta = {
  source: string;
  aprFallbackApplied?: boolean;
  syncPending?: boolean;
};

export type DashboardOverviewResponse = {
  cards: CardData[];
  /** Null while Plaid is connected but liabilities/accounts are not in DB yet */
  timeline: TimelineOutput | null;
  aiInsight: string | null;
  meta: DashboardOverviewMeta;
};

function parseSimulation(r: {
  monthsToZero: number;
  totalInterest: number;
  totalPaid: number;
  balanceArray: number[];
  debtFreeDate: string;
  monthlyPayment: number;
}): SimulationResult {
  return {
    monthsToZero: r.monthsToZero,
    totalInterest: r.totalInterest,
    totalPaid: r.totalPaid,
    balanceArray: r.balanceArray ?? [],
    debtFreeDate: new Date(r.debtFreeDate),
    monthlyPayment: r.monthlyPayment,
  };
}

function parseTimeline(raw: Record<string, unknown>): TimelineOutput {
  const t = raw as {
    future1: Parameters<typeof parseSimulation>[0];
    future2: Parameters<typeof parseSimulation>[0] | null;
    future3: Parameters<typeof parseSimulation>[0] | null;
    recommendedPayment: number;
    interestSavings: number;
    yearsSaved: number;
    insufficientIncome: boolean;
    aprFallbackApplied: boolean;
    limitedHistory: boolean;
  };
  return {
    future1: parseSimulation(t.future1),
    future2: t.future2 ? parseSimulation(t.future2) : null,
    future3: t.future3 ? parseSimulation(t.future3) : null,
    recommendedPayment: t.recommendedPayment,
    interestSavings: t.interestSavings,
    yearsSaved: t.yearsSaved,
    insufficientIncome: t.insufficientIncome,
    aprFallbackApplied: t.aprFallbackApplied,
    limitedHistory: t.limitedHistory,
  };
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewResponse | null> {
  const res = await fetch("/api/dashboard/overview", { credentials: "include" });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    cards: CardData[];
    timeline: Record<string, unknown> | null;
    aiInsight?: string | null;
    meta?: DashboardOverviewMeta;
  };
  return {
    cards: j.cards ?? [],
    timeline: j.timeline ? parseTimeline(j.timeline) : null,
    aiInsight: j.aiInsight ?? null,
    meta: j.meta ?? { source: "unknown" },
  };
}

export async function triggerPlaidFullSync(): Promise<{ ok: boolean; error?: string }> {
  const csrf = document.cookie.match(/(?:^|;\s*)bff_csrf=([^;]+)/)?.[1];
  const res = await fetch("/api/plaid/sync", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": decodeURIComponent(csrf) } : {}),
    },
    body: "{}",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: (err as { error?: string }).error ?? res.statusText };
  }
  return { ok: true };
}
