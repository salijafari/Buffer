import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import {
  fetchDashboardOverview,
  triggerPlaidFullSync,
  type DashboardOverviewResponse,
} from "@/lib/dashboardApi";
import { MOCK_CONNECTED_CARDS } from "../../../data/mockDashboard";
import { useDashboardShell } from "../../../context/DashboardShellContext";
import { OverviewConnectedAccounts } from "./OverviewConnectedAccounts";
import { OverviewCreditHealth } from "./OverviewCreditHealth";
import { OverviewMetricCards } from "./OverviewMetricCards";
import { OverviewPageHeader } from "./OverviewPageHeader";
import { OverviewPaymentPanel } from "./OverviewPaymentPanel";
import { OverviewQuickActions } from "./OverviewQuickActions";
import { OVERVIEW_MOCK, OVERVIEW_MOCK_ACCOUNTS } from "./overviewMock";
import type { CardData } from "../../../types/timeline";

function utilPct(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((balance / limit) * 100));
}

/** Stable empty list so useMemo deps don’t see a new [] every render while loading. */
const EMPTY_LINKED_CARDS: CardData[] = [];

type OverviewPhase = "loading" | "demo" | "live" | "syncing" | "empty" | "error";

export function OverviewPostConnection({
  profile: _profile,
  usePlaidLiveDataOnly,
}: {
  profile: UserOnboardingProfile | null;
  /** True when Plaid is actually connected — no mock banks/timeline. */
  usePlaidLiveDataOnly: boolean;
}) {
  void _profile;
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { refreshPlaidConnection, refreshProfile, plaidConnected } = useDashboardShell();

  const [phase, setPhase] = useState<OverviewPhase>(() => (usePlaidLiveDataOnly ? "loading" : "demo"));
  const [liveCards, setLiveCards] = useState<CardData[] | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const applyLiveOverview = useCallback((d: DashboardOverviewResponse | null) => {
    if (!d) {
      setPhase("error");
      return;
    }
    if (d.cards.length > 0 && d.timeline) {
      setLiveCards(d.cards);
      setPhase("live");
    } else if (d.meta?.syncPending) {
      setPhase("syncing");
    } else {
      setPhase("empty");
    }
  }, []);

  const handlePlaidConnected = useCallback(async () => {
    await Promise.all([refreshPlaidConnection(), refreshProfile()]);
    if (usePlaidLiveDataOnly) {
      setPhase("loading");
      const d = await fetchDashboardOverview();
      applyLiveOverview(d);
    }
  }, [usePlaidLiveDataOnly, refreshPlaidConnection, refreshProfile, applyLiveOverview]);

  useEffect(() => {
    if (!usePlaidLiveDataOnly) {
      setPhase("demo");
      setLiveCards(null);
      return;
    }

    let cancelled = false;
    setPhase("loading");
    void fetchDashboardOverview().then((d) => {
      if (cancelled) return;
      applyLiveOverview(d);
    });
    return () => {
      cancelled = true;
    };
  }, [usePlaidLiveDataOnly, applyLiveOverview]);

  async function handleRefreshPlaidSync() {
    setSyncBusy(true);
    const r = await triggerPlaidFullSync();
    setSyncBusy(false);
    if (!r.ok) return;
    const d = await fetchDashboardOverview();
    applyLiveOverview(d);
  }

  function retryLoadOverview() {
    setPhase("loading");
    void fetchDashboardOverview().then(applyLiveOverview);
  }

  const showDemoChrome = phase === "demo";
  const cards = showDemoChrome ? MOCK_CONNECTED_CARDS : (liveCards ?? EMPTY_LINKED_CARDS);
  const usingLivePlaid = phase === "live";

  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const utilAfterLive = utilPct(totalDebt, totalLimit);

  const creditUtilAfter = useMemo(() => {
    if (usingLivePlaid && cards.length > 0) return utilAfterLive;
    return OVERVIEW_MOCK.creditHealth.utilAfterPct;
  }, [usingLivePlaid, cards.length, utilAfterLive]);

  const nextPaymentDate = useMemo(() => new Date(OVERVIEW_MOCK.payment.nextPaymentDateIso), []);

  /** Green bank row when live + API reports active Plaid; demo always healthy. */
  const bankLinkHealthy = !usePlaidLiveDataOnly || plaidConnected === true;
  const bankLinkBroken = usePlaidLiveDataOnly && plaidConnected === false;

  if (usePlaidLiveDataOnly && phase === "loading") {
    return (
      <Stack
        component="main"
        role="main"
        aria-busy="true"
        aria-label="Loading linked accounts"
        spacing={2}
        sx={{
          px: { xs: 2, lg: 0 },
          py: { xs: 2.5, lg: 0 },
          maxWidth: { xs: "100%", sm: 672, lg: "none" },
          mx: "auto",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Skeleton variant="rounded" height={48} width="60%" sx={{ borderRadius: 1 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, gridColumn: { lg: "span 8" } }} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, gridColumn: { lg: "span 4" } }} />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2, gridColumn: { lg: "span 7" } }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2, gridColumn: { lg: "span 5" } }} />
        </Box>
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "error") {
    return (
      <Stack component="main" role="main" spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="error">
          Couldn&apos;t load your linked accounts. Check your connection and try again.
        </Alert>
        <Button variant="contained" onClick={() => retryLoadOverview()}>
          Retry
        </Button>
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "syncing") {
    return (
      <Stack component="main" role="main" spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="info" sx={{ borderLeft: `4px solid ${primary}` }}>
          <Typography variant="body2" gutterBottom>
            Your bank is connected. We&apos;re importing your credit cards from Plaid — this usually takes under a minute.
          </Typography>
          <Button size="small" variant="contained" disabled={syncBusy} sx={{ mt: 1 }} onClick={() => void handleRefreshPlaidSync()}>
            {syncBusy ? "Syncing…" : "Run sync now"}
          </Button>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          After sync completes, your real balances, APRs, and utilization will show here (no demo bank names).
        </Typography>
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "empty") {
    return (
      <Stack component="main" role="main" spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="warning">
          No credit card accounts were found for this connection. If you expected to see cards, try syncing again or reconnect your institution
          from Account settings when available.
        </Alert>
        <Button variant="outlined" disabled={syncBusy} onClick={() => void handleRefreshPlaidSync()}>
          {syncBusy ? "Syncing…" : "Run sync again"}
        </Button>
      </Stack>
    );
  }

  const metrics = OVERVIEW_MOCK.metrics;
  const payment = OVERVIEW_MOCK.payment;
  const ch = OVERVIEW_MOCK.creditHealth;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Dashboard overview"
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        pb: { xs: 3, lg: 2 },
        boxSizing: "border-box",
      }}
    >
      <OverviewPageHeader />

      {/* Payoff Progress hero hidden for now — component preserved in ./OverviewPayoffProgress.tsx to restore later. */}

      {/* Single 12-col grid like Stitch HTML: `grid grid-cols-1 lg:grid-cols-12 gap-8` */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, minmax(0, 1fr))" },
          gap: { xs: 3, lg: 4 },
          alignItems: "stretch",
        }}
      >
        <OverviewMetricCards
          interestSavedThisMonth={metrics.interestSavedThisMonth}
          interestSavedCumulative={metrics.interestSavedCumulative}
          availableCredit={metrics.availableCredit}
          breathingRoomMonthly={metrics.breathingRoomMonthly}
        />

        <Box sx={{ gridColumn: { lg: "span 8" }, minWidth: 0 }}>
          <OverviewPaymentPanel
            currentBalance={payment.currentBalance}
            nextPaymentAmount={payment.nextPaymentAmount}
            nextPaymentDate={nextPaymentDate}
            autopayOn={payment.autopayOn}
            bankLabel={payment.bankLabel}
            bankMask={payment.bankMask}
          />
        </Box>
        <Box sx={{ gridColumn: { lg: "span 4" }, minWidth: 0 }}>
          <OverviewCreditHealth
            utilBeforePct={ch.utilBeforePct}
            utilAfterPct={creditUtilAfter}
            onTimeStreakMonths={ch.onTimeStreakMonths}
            scoreTrendPts={ch.scoreTrendPts}
          />
        </Box>

        <Box sx={{ gridColumn: { lg: "span 7" }, minWidth: 0 }}>
          <OverviewConnectedAccounts
            updatedLabel={OVERVIEW_MOCK.accountsUpdatedLabel}
            accounts={OVERVIEW_MOCK_ACCOUNTS}
            bankLinkHealthy={bankLinkHealthy}
            bankLinkBroken={bankLinkBroken}
            onPlaidConnected={handlePlaidConnected}
          />
        </Box>
        <Box sx={{ gridColumn: { lg: "span 5" }, minWidth: 0 }}>
          <OverviewQuickActions onPlaidConnected={handlePlaidConnected} />
        </Box>
      </Box>
    </Stack>
  );
}
