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
} from "@mui/material";
import type { TimelineOutput, CardData, CreditScore } from "../../types/timeline";

const MOCK_TIMELINE: TimelineOutput = {
  future1: {
    monthsToZero: 87,
    totalInterest: 4820,
    totalPaid: 16320,
    balanceArray: Array.from({ length: 87 }, (_, i) => Math.max(0, 11500 - i * 132)),
    debtFreeDate: new Date(Date.now() + 87 * 30 * 86400000),
    monthlyPayment: 210,
  },
  future2: {
    monthsToZero: 52,
    totalInterest: 2640,
    totalPaid: 14140,
    balanceArray: Array.from({ length: 52 }, (_, i) => Math.max(0, 11500 - i * 221)),
    debtFreeDate: new Date(Date.now() + 52 * 30 * 86400000),
    monthlyPayment: 450,
  },
  future3: {
    monthsToZero: 22,
    totalInterest: 780,
    totalPaid: 12280,
    balanceArray: Array.from({ length: 22 }, (_, i) => Math.max(0, 11500 - i * 523)),
    debtFreeDate: new Date(Date.now() + 22 * 30 * 86400000),
    monthlyPayment: 700,
  },
  recommendedPayment: 700,
  interestSavings: 4040,
  yearsSaved: 5.4,
  insufficientIncome: false,
  aprFallbackApplied: false,
  limitedHistory: false,
};

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

export function HomeScreen() {
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

  if (!isLoaded) return <SkeletonHome />;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Dashboard home"
      spacing={2}
      sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%", pb: { xs: 3, sm: 3 } }}
    >
      <Card
        variant="outlined"
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.main}14 0%, ${t.palette.background.paper} 45%, #F0FDFA 100%)`,
          borderColor: "rgba(0, 201, 167, 0.35)",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="caption" fontWeight={700} letterSpacing={2} color="primary.main" display="block" gutterBottom>
            DEBT-FREE DATE
          </Typography>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {fmtDate(timeline.future3!.debtFreeDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {timeline.future3!.monthsToZero} months ·{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
              {fmtCurrency(timeline.interestSavings)}
            </Box>{" "}
            interest saved
          </Typography>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
        <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Net Worth
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              fontFamily="ui-monospace, monospace"
              color={netWorth < 0 ? "error.main" : "primary.main"}
            >
              {fmtCurrency(netWorth)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {fmtCurrency(totalDebt)} debt
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Credit Score
            </Typography>
            <Typography variant="h6" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: scoreColor(score.band) }}>
              {score.score}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: scoreColor(score.band) }}>
              {scoreLabel(score.band)} · via {score.bureau}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Your Cards
          </Typography>
          <Typography variant="caption" fontFamily="ui-monospace, monospace" color="text.secondary">
            {fmtCurrency(totalDebt)} total · {utilPct(totalDebt, totalLimit)}% util
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
    </Stack>
  );
}

function SkeletonHome() {
  return (
    <Stack spacing={2} sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto" }} aria-busy="true" aria-label="Loading dashboard">
      <Skeleton variant="rounded" height={144} />
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
      </Stack>
      <Skeleton variant="rounded" height={96} />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={64} />
      ))}
    </Stack>
  );
}
