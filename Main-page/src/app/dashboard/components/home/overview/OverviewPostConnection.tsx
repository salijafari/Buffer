import { useCallback, useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography, useTheme } from "@mui/material";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { triggerPlaidFullSync } from "@/lib/dashboardApi";
import { useDashboardShell } from "../../../context/DashboardShellContext";
import { useLiveFinancialDisplay } from "../../../hooks/useLiveFinancialDisplay";
import { OverviewConnectedAccounts } from "./OverviewConnectedAccounts";
import { OverviewCreditHealth } from "./OverviewCreditHealth";
import { OverviewMetricCards } from "./OverviewMetricCards";
import { OverviewPageHeader } from "./OverviewPageHeader";
import { OverviewPaymentPanel } from "./OverviewPaymentPanel";
import { OverviewQuickActions } from "./OverviewQuickActions";
import { OverviewReassuranceFooter } from "./OverviewReassuranceFooter";
import { OVERVIEW_MOCK, OVERVIEW_MOCK_ACCOUNTS, type OverviewConnectedAccountRow } from "./overviewMock";
import type { CardData } from "../../../types/timeline";
import type { TimelineOutput } from "../../../types/timeline";

function utilPct(balance: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((balance / limit) * 100));
}

function deriveFromLive(cards: CardData[], timeline: TimelineOutput | null) {
  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const avail = cards.reduce((s, c) => s + Math.max(0, c.limit - c.balance), 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const utilAfter = totalLimit > 0 ? utilPct(totalBalance, totalLimit) : OVERVIEW_MOCK.creditHealth.utilAfterPct;
  const interestCum = timeline ? Math.max(0, Math.round(timeline.interestSavings)) : OVERVIEW_MOCK.metrics.interestSavedCumulative;
  const interestMonth = Math.max(1, Math.round(interestCum / 24));
  const recPay = timeline?.recommendedPayment ?? OVERVIEW_MOCK.payment.nextPaymentAmount;
  const breathing = Math.max(1, Math.round(recPay * 0.35));

  const accounts: OverviewConnectedAccountRow[] = [];
  if (cards.length > 0) {
    const inst = cards[0].institution || "Bank";
    accounts.push({ kind: "bank", name: inst, mask: "****" });
    for (const c of cards) {
      accounts.push({ kind: "card_paid", name: c.name, mask: c.last4 });
    }
  } else {
    accounts.push(...OVERVIEW_MOCK_ACCOUNTS);
  }

  return {
    metrics: {
      interestSavedThisMonth: interestMonth,
      interestSavedCumulative: interestCum,
      availableCredit: avail,
      breathingRoomMonthly: breathing,
    },
    payment: {
      ...OVERVIEW_MOCK.payment,
      currentBalance: totalBalance,
      nextPaymentAmount: recPay,
    },
    creditHealth: {
      ...OVERVIEW_MOCK.creditHealth,
      utilAfterPct: utilAfter,
    },
    accounts,
  };
}

export function OverviewPostConnection({ profile: _profile }: { profile: UserOnboardingProfile | null }) {
  void _profile;
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { refreshPlaidConnection, refreshProfile, plaidConnected } = useDashboardShell();
  const { overview, showLiveFinancials, overviewPending, overviewAttempted, reloadOverview } = useLiveFinancialDisplay();
  const [syncBusy, setSyncBusy] = useState(false);

  const handlePlaidConnected = useCallback(async () => {
    await Promise.all([refreshPlaidConnection(), refreshProfile()]);
    reloadOverview();
  }, [refreshPlaidConnection, refreshProfile, reloadOverview]);

  async function handleRefreshPlaidSync() {
    setSyncBusy(true);
    const r = await triggerPlaidFullSync();
    setSyncBusy(false);
    if (!r.ok) return;
    reloadOverview();
  }

  const derived = useMemo(() => {
    if (showLiveFinancials && overview) {
      return deriveFromLive(overview.cards, overview.timeline);
    }
    return {
      metrics: OVERVIEW_MOCK.metrics,
      payment: OVERVIEW_MOCK.payment,
      creditHealth: OVERVIEW_MOCK.creditHealth,
      accounts: OVERVIEW_MOCK_ACCOUNTS,
    };
  }, [showLiveFinancials, overview]);

  const nextPaymentDate = useMemo(() => new Date(OVERVIEW_MOCK.payment.nextPaymentDateIso), []);

  const loadingLinked = plaidConnected === true && overviewPending;
  const fetchFailed = plaidConnected === true && overviewAttempted && !overviewPending && overview === null;
  const syncing =
    plaidConnected === true && overview && overview.cards.length === 0 && overview.meta?.syncPending === true;
  const empty =
    plaidConnected === true &&
    overview &&
    overview.cards.length === 0 &&
    !overview.meta?.syncPending;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Dashboard overview"
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        pb: { xs: 3, lg: 5 },
        boxSizing: "border-box",
      }}
    >
      {loadingLinked ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: "16px" }} icon={false}>
          <Typography variant="body2">Loading your linked account data…</Typography>
        </Alert>
      ) : null}

      {fetchFailed ? (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: "16px" }}
          action={<Button onClick={() => reloadOverview()}>Retry</Button>}
        >
          Couldn&apos;t load linked accounts. Financial figures are hidden until sync succeeds.
        </Alert>
      ) : null}

      {syncing ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: "16px", borderLeft: `4px solid ${primary}` }}>
          <Typography variant="body2" component="span">
            Importing your credit cards — this usually takes under a minute.
          </Typography>
          <Button size="small" variant="contained" disabled={syncBusy} sx={{ ml: 2 }} onClick={() => void handleRefreshPlaidSync()}>
            {syncBusy ? "Syncing…" : "Run sync now"}
          </Button>
        </Alert>
      ) : null}

      {empty ? (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "16px" }}>
          No credit card accounts found for this link.
          <Button size="small" sx={{ ml: 1 }} disabled={syncBusy} onClick={() => void handleRefreshPlaidSync()}>
            {syncBusy ? "Syncing…" : "Run sync"}
          </Button>
        </Alert>
      ) : null}

      <OverviewPageHeader />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, minmax(0, 1fr))" },
          gap: { xs: 3, lg: 4 },
          alignItems: "stretch",
        }}
      >
        <OverviewMetricCards
          interestSavedThisMonth={derived.metrics.interestSavedThisMonth}
          interestSavedCumulative={derived.metrics.interestSavedCumulative}
          availableCredit={derived.metrics.availableCredit}
          breathingRoomMonthly={derived.metrics.breathingRoomMonthly}
          showLiveFinancials={showLiveFinancials}
        />

        <Box sx={{ gridColumn: { lg: "span 8" }, minWidth: 0 }}>
          <OverviewPaymentPanel
            currentBalance={derived.payment.currentBalance}
            nextPaymentAmount={derived.payment.nextPaymentAmount}
            nextPaymentDate={nextPaymentDate}
            autopayOn={derived.payment.autopayOn}
            bankLabel={derived.payment.bankLabel}
            bankMask={derived.payment.bankMask}
            showLiveFinancials={showLiveFinancials}
          />
        </Box>
        <Box sx={{ gridColumn: { lg: "span 4" }, minWidth: 0 }}>
          <OverviewCreditHealth
            utilBeforePct={derived.creditHealth.utilBeforePct}
            utilAfterPct={derived.creditHealth.utilAfterPct}
            onTimeStreakMonths={derived.creditHealth.onTimeStreakMonths}
            scoreTrendPts={derived.creditHealth.scoreTrendPts}
            showLiveFinancials={showLiveFinancials}
          />
        </Box>

        <Box sx={{ gridColumn: { lg: "span 7" }, minWidth: 0 }}>
          <OverviewConnectedAccounts
            updatedLabel={OVERVIEW_MOCK.accountsUpdatedLabel}
            accounts={derived.accounts}
            bankLinkBroken={false}
            onPlaidConnected={handlePlaidConnected}
            showLiveFinancials={showLiveFinancials}
          />
        </Box>
        <Box sx={{ gridColumn: { lg: "span 5" }, minWidth: 0 }}>
          <OverviewQuickActions onPlaidConnected={handlePlaidConnected} />
        </Box>

        <OverviewReassuranceFooter />
      </Box>
    </Stack>
  );
}
