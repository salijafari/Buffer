import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimelineOutput, CardData, CreditScore } from "../../types/timeline";
import { MOCK_TIMELINE } from "../../data/mockTimeline";

const MOCK_CARDS: CardData[] = [
  { id: "1", name: "TD Cashback Visa", last4: "4242", balance: 6800, apr: 0.1999, limit: 10000, institution: "TD", color: "#00A651" },
  { id: "2", name: "Scotiabank Gold Amex", last4: "8891", balance: 3200, apr: 0.2114, limit: 5000, institution: "BNS", color: "#EC0926" },
  { id: "3", name: "CIBC Visa Dividend", last4: "3377", balance: 1500, apr: 0.1999, limit: 3000, institution: "CIBC", color: "#C31E2E" },
];

const MOCK_SCORE: CreditScore = {
  score: 682,
  band: "fair",
  reportDate: "2026-03-01",
  bureau: "equifax",
  history: [
    { month: "Sep", score: 641 },
    { month: "Oct", score: 649 },
    { month: "Nov", score: 658 },
    { month: "Dec", score: 665 },
    { month: "Jan", score: 672 },
    { month: "Feb", score: 679 },
    { month: "Mar", score: 682 },
  ],
};

function fmtCurrency(n: number, decimals = 0): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long" });
}

function utilPct(balance: number, limit: number): number {
  return limit > 0 ? Math.round((balance / limit) * 100) : 0;
}

function scoreColor(band: CreditScore["band"]): string {
  const map: Record<CreditScore["band"], string> = {
    poor: "#FF6B6B",
    fair: "#F59E0B",
    good: "#60A5FA",
    very_good: "#34D399",
    excellent: "#00C9A7",
  };
  return map[band];
}

function scoreLabel(band: CreditScore["band"]): string {
  const map: Record<CreditScore["band"], string> = {
    poor: "Poor",
    fair: "Fair",
    good: "Good",
    very_good: "Very Good",
    excellent: "Excellent",
  };
  return map[band];
}

function buildBalanceSeries(balanceArray: number[]) {
  return balanceArray.map((balance, i) => ({ month: i + 1, balance }));
}

function buildNetWorthSeries(balanceArray: number[]) {
  return balanceArray.map((balance, i) => ({ month: i + 1, netWorth: -balance }));
}

/** Desktop right-rail: same mock figures as overview (no new data). */
export function HomeRightRail() {
  const timeline = MOCK_TIMELINE;
  const score = MOCK_SCORE;
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Plan snapshot
      </Typography>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          Interest savings (plan)
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#00C9A7", fontFamily: "ui-monospace, monospace", mt: 0.5 }}>
          {fmtCurrency(timeline.interestSavings)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          Months to zero (plan)
        </Typography>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {timeline.future3?.monthsToZero ?? "—"}
        </Typography>
      </Box>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          Credit score
        </Typography>
        <Typography variant="h5" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: scoreColor(score.band), mt: 0.5 }}>
          {score.score}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {scoreLabel(score.band)} · via {score.bureau}
        </Typography>
      </Box>
    </Stack>
  );
}

export function HomeScreen() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [timeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [cards] = useState<CardData[]>(MOCK_CARDS);
  const [score] = useState<CreditScore>(MOCK_SCORE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const netWorth = -totalDebt;
  const overallUtil = utilPct(totalDebt, totalLimit);
  const f3 = timeline.future3;
  const balanceSeries = f3 ? buildBalanceSeries(f3.balanceArray) : [];
  const netWorthSeries = f3 ? buildNetWorthSeries(f3.balanceArray) : [];

  if (!isLoaded) return <SkeletonHome isDesktop={isDesktop} />;

  const heroCard = (
    <Card
      variant="outlined"
      sx={{
        background: (t) =>
          `linear-gradient(135deg, ${t.palette.primary.main}14 0%, ${t.palette.background.paper} 45%, #F0FDFA 100%)`,
        borderColor: "rgba(0, 201, 167, 0.35)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
        <Typography variant="caption" fontWeight={700} letterSpacing={2} color="primary.main" display="block" gutterBottom>
          DEBT-FREE DATE
        </Typography>
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          sx={{ fontSize: { xs: undefined, lg: "clamp(2.5rem, 4vw, 3.5rem)" }, lineHeight: 1.15 }}
        >
          {fmtDate(timeline.future3!.debtFreeDate)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { lg: "1rem" } }}>
          {timeline.future3!.monthsToZero} months ·{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
            {fmtCurrency(timeline.interestSavings)}
          </Box>{" "}
          interest saved
        </Typography>
      </CardContent>
    </Card>
  );

  const balanceProgressChart = f3 ? (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { lg: "1.125rem" } }} gutterBottom>
          Balance progress
        </Typography>
        <Box sx={{ height: { xs: 180, lg: 260 }, width: "100%", mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="homeBalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis tick={{ fill: "#64748B", fontSize: 10, fontFamily: "ui-monospace, monospace" }} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} width={44} />
              <Tooltip formatter={(v: number) => fmtCurrency(v, 0)} />
              <Area type="monotone" dataKey="balance" stroke="#00C9A7" strokeWidth={2} fill="url(#homeBalGrad)" name="Balance" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  ) : null;

  const utilizationCard = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { lg: "1.125rem" } }} gutterBottom>
          Overall utilization
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, overallUtil)}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                bgcolor: overallUtil > 80 ? "#FF6B6B" : overallUtil > 50 ? "#F59E0B" : "#00C9A7",
              },
            }}
          />
          <Typography variant="body2" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ minWidth: 40 }}>
            {overallUtil}%
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {fmtCurrency(totalDebt)} total · {fmtCurrency(totalLimit)} limits
        </Typography>
      </CardContent>
    </Card>
  );

  const netWorthChart = f3 ? (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { lg: "1.125rem" } }} gutterBottom>
          Net worth trajectory
        </Typography>
        <Box sx={{ height: { xs: 180, lg: 260 }, width: "100%", mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="homeNwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis tick={{ fill: "#64748B", fontSize: 10, fontFamily: "ui-monospace, monospace" }} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} width={44} />
              <Tooltip formatter={(v: number) => fmtCurrency(v, 0)} />
              <Area type="monotone" dataKey="netWorth" stroke="#FF6B6B" strokeWidth={2} fill="url(#homeNwGrad)" name="Net worth" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  ) : null;

  const netWorthMiniCard = (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Net Worth
        </Typography>
        <Typography variant="h6" fontWeight={700} fontFamily="ui-monospace, monospace" color={netWorth < 0 ? "error.main" : "primary.main"} sx={{ fontSize: { lg: "1.5rem" } }}>
          {fmtCurrency(netWorth)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {fmtCurrency(totalDebt)} debt
        </Typography>
      </CardContent>
    </Card>
  );

  const creditMiniCard = (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Credit Score
        </Typography>
        <Typography variant="h6" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: scoreColor(score.band), fontSize: { lg: "1.5rem" } }}>
          {score.score}
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: scoreColor(score.band) }}>
          {scoreLabel(score.band)} · via {score.bureau}
        </Typography>
      </CardContent>
    </Card>
  );

  const cardsFeed = (
    <Box sx={{ flex: { lg: "1 1 50%" }, minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { lg: "1.125rem" } }}>
          Your Cards
        </Typography>
        <Typography variant="caption" fontFamily="ui-monospace, monospace" color="text.secondary">
          {fmtCurrency(totalDebt)} total · {overallUtil}% util
        </Typography>
      </Stack>
      <Stack spacing={{ xs: 1, lg: 2 }}>
        {cards.map((card) => {
          const util = utilPct(card.balance, card.limit);
          const utilBarColor = util > 80 ? "#FF6B6B" : util > 50 ? "#F59E0B" : "#00C9A7";
          return (
            <Card key={card.id} variant="outlined" component="article">
              <CardContent
                sx={{
                  py: { xs: 2, lg: 2.5 },
                  px: { xs: 2, lg: 3 },
                  "&:last-child": { pb: { xs: 2, lg: 2.5 } },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: card.color ?? "#94A3B8",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {card.institution.slice(0, 2)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={1}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {card.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ flexShrink: 0 }}>
                      {fmtCurrency(card.balance)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, util)}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: "grey.200",
                        "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: utilBarColor },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: 32 }}>
                      {util}%
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );

  const rightColumnStack = (
    <Stack spacing={{ xs: 1.5, lg: 2 }} sx={{ flex: { lg: "1 1 50%" }, minWidth: 0 }}>
      {utilizationCard}
      <Stack direction={{ xs: "row", lg: "column" }} spacing={{ xs: 1.5, lg: 2 }} useFlexGap flexWrap={{ xs: "wrap", lg: "nowrap" }}>
        {netWorthMiniCard}
        {creditMiniCard}
      </Stack>
    </Stack>
  );

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Dashboard home"
      spacing={{ xs: 2, lg: 3 }}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        pb: { xs: 3, lg: 2 },
      }}
    >
      {heroCard}

      {!isDesktop && (
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          {netWorthMiniCard}
          {creditMiniCard}
        </Stack>
      )}

      {isDesktop && balanceProgressChart}

      {isDesktop ? (
        <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
          {cardsFeed}
          {rightColumnStack}
        </Stack>
      ) : (
        <>
          {balanceProgressChart}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                Your Cards
              </Typography>
              <Typography variant="caption" fontFamily="ui-monospace, monospace" color="text.secondary">
                {fmtCurrency(totalDebt)} total · {overallUtil}% util
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {cards.map((card) => {
                const util = utilPct(card.balance, card.limit);
                const utilBarColor = util > 80 ? "#FF6B6B" : util > 50 ? "#F59E0B" : "#00C9A7";
                return (
                  <Card key={card.id} variant="outlined" component="article">
                    <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: card.color ?? "#94A3B8",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {card.institution.slice(0, 2)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={1}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {card.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ flexShrink: 0 }}>
                            {fmtCurrency(card.balance)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, util)}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 999,
                              bgcolor: "grey.200",
                              "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: utilBarColor },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: 32 }}>
                            {util}%
                          </Typography>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </>
      )}

      {isDesktop && netWorthChart}
    </Stack>
  );
}

function SkeletonHome({ isDesktop }: { isDesktop: boolean }) {
  return (
    <Stack spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { xs: 672, lg: "none" }, mx: "auto" }} aria-busy="true" aria-label="Loading dashboard">
      <Skeleton variant="rounded" height={144} sx={{ borderRadius: 2 }} />
      {!isDesktop && (
        <Stack direction="row" spacing={1.5}>
          <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
        </Stack>
      )}
      {isDesktop && <Skeleton variant="rounded" height={260} />}
      {isDesktop ? (
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
        </Stack>
      ) : (
        <>
          <Skeleton variant="rounded" height={96} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </>
      )}
    </Stack>
  );
}
