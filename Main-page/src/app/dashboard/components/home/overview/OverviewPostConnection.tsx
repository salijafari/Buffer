import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import {
  fetchDashboardOverview,
  triggerPlaidFullSync,
  type DashboardOverviewResponse,
} from "@/lib/dashboardApi";
import { MOCK_TIMELINE } from "../../../data/mockTimeline";
import {
  MOCK_AI_INSIGHT_OVERVIEW,
  MOCK_CONNECTED_CARDS,
  MOCK_CREDIT_BUILDER_ONLY,
  MOCK_HAS_BUFFER_CREDIT_LINE,
  MOCK_REWARDS_POINTS,
  MOCK_REWARDS_POINTS_TO_MILESTONE,
} from "../../../data/mockDashboard";
import { monthlyInterestCost } from "../../../lib/dashboardFormulas";
import { fmtCurrency, fmtDate } from "../../../lib/dashboardFormat";
import type { CardData, TimelineOutput } from "../../../types/timeline";

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
  const navigate = useNavigate();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const [phase, setPhase] = useState<OverviewPhase>(() => (usePlaidLiveDataOnly ? "loading" : "demo"));
  const [liveCards, setLiveCards] = useState<CardData[] | null>(null);
  const [liveTimeline, setLiveTimeline] = useState<TimelineOutput | null>(null);
  const [liveAiInsight, setLiveAiInsight] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  const applyLiveOverview = useCallback((d: DashboardOverviewResponse | null) => {
    if (!d) {
      setPhase("error");
      return;
    }
    if (d.cards.length > 0 && d.timeline) {
      setLiveCards(d.cards);
      setLiveTimeline(d.timeline);
      setLiveAiInsight(d.aiInsight);
      setPhase("live");
    } else if (d.meta?.syncPending) {
      setPhase("syncing");
    } else {
      setPhase("empty");
    }
  }, []);

  useEffect(() => {
    if (!usePlaidLiveDataOnly) {
      setPhase("demo");
      setLiveCards(null);
      setLiveTimeline(null);
      setLiveAiInsight(null);
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
  const timeline = showDemoChrome ? MOCK_TIMELINE : (liveTimeline ?? MOCK_TIMELINE);
  const usingLivePlaid = phase === "live";
  const f1 = timeline.future1;
  const f2 = timeline.future2 ?? timeline.future1;
  const f3 = timeline.future3 ?? timeline.future1;

  const chartData = useMemo(() => {
    const maxLen = Math.max(f1.balanceArray.length, f2.balanceArray.length, f3.balanceArray.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      month: i + 1,
      minimum: f1.balanceArray[i] ?? null,
      currentPace: f2.balanceArray[i] ?? null,
      buffer: f3.balanceArray[i] ?? null,
    }));
  }, [f1.balanceArray, f2.balanceArray, f3.balanceArray]);

  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtil = utilPct(totalDebt, totalLimit);

  const interestRows = useMemo(() => {
    const rows = cards.map((c) => {
      const apr = c.apr ?? 0.2;
      const mi = monthlyInterestCost(c.balance, apr);
      return { ...c, apr, monthlyInterest: mi };
    });
    rows.sort((a, b) => b.monthlyInterest - a.monthlyInterest);
    const totalMi = rows.reduce((s, r) => s + r.monthlyInterest, 0);
    const withoutBuffer = totalMi;
    const bufferSaved = Math.max(0, withoutBuffer * 0.15);
    return { rows, totalMi, bufferSaved };
  }, [cards]);

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
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={120} />
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

  const hero = (
    <Card variant="outlined" sx={{ borderColor: `${primary}55` }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="caption" fontWeight={700} letterSpacing={1.2} color="primary" display="block" gutterBottom>
          DEBT-FREE DATE
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: "1.85rem", lg: "clamp(2.25rem, 4vw, 3rem)" } }}>
          {fmtDate(f3.debtFreeDate)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {f3.monthsToZero} months from today
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }} useFlexGap flexWrap="wrap">
          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Interest saved:
            </Box>{" "}
            {fmtCurrency(timeline.interestSavings, 0)}
          </Typography>
          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Time saved:
            </Box>{" "}
            {timeline.yearsSaved.toFixed(1)} years vs. minimum payments
          </Typography>
        </Stack>
        <Chip
          label={`~${fmtCurrency(timeline.interestSavings / Math.max(1, f3.monthsToZero), 0)}/mo saved`}
          size="small"
          sx={{ mt: 1.5, bgcolor: `${primary}22`, color: "primary.dark", fontWeight: 600 }}
        />
      </CardContent>
    </Card>
  );

  const balanceChart = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Balance progress
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {usingLivePlaid
            ? "Projections from your linked balances and APRs (estimates)."
            : showDemoChrome
              ? "Minimum payments vs. your pace vs. Buffer (illustrative mock)"
              : "Projections from your linked data."}
        </Typography>
        {/* Recharts ResponsiveContainer needs a parent with explicit height (not an auto-height wrapper). */}
        <Box
          sx={{
            height: { xs: 220, lg: 280 },
            width: "100%",
            minWidth: { xs: 480, lg: "auto" },
            overflowX: "auto",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: "Months", position: "insideBottom", offset: -4 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                width={44}
              />
              <Tooltip formatter={(v: number) => (v != null ? fmtCurrency(v, 0) : "—")} />
              <Legend />
              <ReferenceLine x={1} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: "Start", position: "top", fill: "#64748B", fontSize: 10 }} />
              <Line type="monotone" dataKey="minimum" name="Minimums" stroke="#94A3B8" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="currentPace" name="Your pace" stroke="#F59E0B" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="buffer" name="With Buffer" stroke={primary} strokeWidth={2.5} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const interestCard = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Monthly interest breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {fmtCurrency(interestRows.totalMi, 0)} total this month — saving ~{fmtCurrency(interestRows.bufferSaved, 0)} vs. your
          old rates{usingLivePlaid ? " (from linked APRs)" : showDemoChrome ? " (mock)" : ""}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Card</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">APR</TableCell>
                <TableCell align="right">Interest/mo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interestRows.rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right">{fmtCurrency(r.balance, 0)}</TableCell>
                  <TableCell align="right">{((r.apr ?? 0) * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{fmtCurrency(r.monthlyInterest, 0)}</TableCell>
                </TableRow>
              ))}
              {showDemoChrome && MOCK_HAS_BUFFER_CREDIT_LINE && !MOCK_CREDIT_BUILDER_ONLY ? (
                <TableRow sx={{ bgcolor: `${primary}0f` }}>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Buffer line — lower APR applied to transferred balances (mock)
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const aiBanner =
    bannerOpen && ((usingLivePlaid && Boolean(liveAiInsight)) || showDemoChrome) ? (
      <Alert
        severity="info"
        icon={false}
        sx={{
          borderLeft: `4px solid ${primary}`,
          alignItems: "center",
          "& .MuiAlert-message": { width: "100%" },
        }}
        action={
          <IconButton size="small" aria-label="Dismiss" onClick={() => setBannerOpen(false)}>
            <X size={18} />
          </IconButton>
        }
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: "100%" }}>
          <Typography variant="body2">{liveAiInsight ?? (showDemoChrome ? MOCK_AI_INSIGHT_OVERVIEW : "")}</Typography>
          <Button size="small" endIcon={<ChevronRight size={16} />} onClick={() => void navigate("/dashboard/ai")}>
            AI
          </Button>
        </Stack>
      </Alert>
    ) : null;

  const cardsSection = (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {fmtCurrency(totalDebt, 0)} total across {cards.length} cards · {overallUtil}% overall utilization
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {cards.map((card) => {
          const util = utilPct(card.balance, card.limit);
          const utilBarColor = util > 80 ? "#FF6B6B" : util > 50 ? "#F59E0B" : primary;
          return (
            <Card
              key={card.id}
              variant="outlined"
              component="button"
              type="button"
              onClick={() => void navigate("/dashboard/payoff")}
              sx={{ textAlign: "left", cursor: "pointer", "&:hover": { borderColor: primary } }}
            >
              <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: card.color ?? "#94A3B8", fontSize: "0.75rem" }}>
                    {(card.institution || "—").slice(0, 2)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {card.name}
                    </Typography>
                    <Typography variant="body2" fontFamily="ui-monospace, monospace">
                      {fmtCurrency(card.balance, 0)} · {card.apr != null ? `${(card.apr * 100).toFixed(2)}%` : "—"} APR
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, util)}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: "grey.200",
                        "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: utilBarColor },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Utilization {util}%
                      {usingLivePlaid
                        ? " · Due dates from Plaid when available"
                        : showDemoChrome
                          ? " · Due & min payment: connect for live dates (mock)"
                          : ""}
                    </Typography>
                  </Box>
                  <ChevronRight size={20} aria-hidden />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
      <Button variant="outlined" sx={{ mt: 2 }} disabled>
        Add a card
      </Button>
    </Box>
  );

  const bufferLineCard =
    showDemoChrome && MOCK_HAS_BUFFER_CREDIT_LINE && !MOCK_CREDIT_BUILDER_ONLY ? (
      <Card variant="outlined" sx={{ borderColor: `${primary}44` }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Buffer credit line
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Available
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {fmtCurrency(4200, 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Balance
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {fmtCurrency(7800, 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                APR
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                15.5%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Next payment
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                Mar 15 · {fmtCurrency(430, 0)}
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => void navigate("/dashboard/payoff")}>
            Transfer a balance
          </Button>
        </CardContent>
      </Card>
    ) : null;

  const rewards = showDemoChrome ? (
    <Chip
      label={`${MOCK_REWARDS_POINTS} points — ${MOCK_REWARDS_POINTS_TO_MILESTONE} points from an APR reduction`}
      variant="outlined"
      onClick={() => void navigate("/dashboard/account")}
      sx={{ alignSelf: "flex-start" }}
    />
  ) : null;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Dashboard overview"
      spacing={{ xs: 2, lg: 3 }}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        pb: { xs: 3, lg: 2 },
        boxSizing: "border-box",
      }}
    >
      {hero}
      {balanceChart}
      {aiBanner}
      {interestCard}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>{cardsSection}</Box>
        {isLg && bufferLineCard ? <Box sx={{ width: 320, flexShrink: 0 }}>{bufferLineCard}</Box> : null}
      </Stack>
      {!isLg && bufferLineCard ? bufferLineCard : null}
      {rewards}
    </Stack>
  );
}
