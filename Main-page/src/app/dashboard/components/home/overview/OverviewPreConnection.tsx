import { Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { useDashboardShell } from "../../../context/DashboardShellContext";
import { PlaidConnectButton } from "../../plaid/PlaidConnectButton";
import { FINANCE } from "../../../lib/finance";
import {
  affordablePaymentRangeCad,
  canadianMinimumMonthlyPayment,
  estimatedAprFromCreditScore,
  monthlyInterestCost,
  simulateAggregatePayoff,
} from "../../../lib/dashboardFormulas";
import { fmtCurrency, fmtDate, fmtMonthsRelative } from "../../../lib/dashboardFormat";
import {
  cohortStatLine,
  MOCK_ILLUSTRATIVE_DEBT,
  MOCK_ILLUSTRATIVE_MONTHLY_PAYMENT,
  MOCK_PRE_CONNECTION_CARD_COUNT,
} from "../../../data/mockDashboard";

function debtBracketLabel(debt: number): string {
  if (debt < 10_000) return "under $10K";
  if (debt < 20_000) return "$10K–$20K";
  return "$20K+";
}

export function OverviewPreConnection({ profile }: { profile: UserOnboardingProfile | null }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { refreshPlaidConnection, refreshProfile } = useDashboardShell();

  const handlePlaidConnected = () => {
    void Promise.all([refreshPlaidConnection(), refreshProfile()]);
  };

  const debt = MOCK_ILLUSTRATIVE_DEBT;
  const apr = estimatedAprFromCreditScore(profile?.credit_score ?? null);
  const aprPct = Math.round(apr * 1000) / 10;
  const monthlyInterest = monthlyInterestCost(debt, apr);
  const yearlyInterest = monthlyInterest * 12;

  const minPay = canadianMinimumMonthlyPayment(debt, apr);
  const userPay = MOCK_ILLUSTRATIVE_MONTHLY_PAYMENT;

  const simMin = simulateAggregatePayoff(debt, apr, minPay);
  const simUser = simulateAggregatePayoff(debt, apr, userPay);
  const simBuffer = simulateAggregatePayoff(debt, FINANCE.BUFFER_APR_MIDPOINT, userPay);

  const provinceName = profile?.province_name?.trim() || "Canada";
  const cohort = cohortStatLine(provinceName, debtBracketLabel(debt));

  const income = profile?.annual_pre_tax_income;
  const afford = income != null && income > 0 ? affordablePaymentRangeCad(income) : null;
  const midPay = afford ? Math.round((afford.low + afford.high) / 2) : null;
  const simAfford = midPay ? simulateAggregatePayoff(debt, FINANCE.BUFFER_APR_MIDPOINT, midPay) : null;

  const col = (title: string, sim: typeof simMin, highlight?: boolean) => (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 200 },
        borderLeft: highlight ? `4px solid ${primary}` : undefined,
        bgcolor: highlight ? `${primary}0d` : "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
        <Typography variant="subtitle2" fontWeight={700} color={highlight ? "primary" : "text.secondary"} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Debt-free
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {fmtDate(sim.debtFreeDate)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Total interest: {fmtCurrency(sim.totalInterest, 0)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Total paid: {fmtCurrency(sim.totalPaid, 0)}
        </Typography>
      </CardContent>
    </Card>
  );

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
      <Card variant="outlined" elevation={2} sx={{ borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
          <Typography variant="caption" fontWeight={700} letterSpacing={1.2} color="primary" display="block" gutterBottom>
            ESTIMATED INTEREST COST
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: "1.75rem", lg: "2.25rem" } }}>
            {fmtCurrency(monthlyInterest, 0)}/mo
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            That&apos;s {fmtCurrency(yearlyInterest, 0)} per year in interest alone.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
            Illustrative estimate based on ${debt.toLocaleString("en-CA")} in credit card debt at ~{aprPct}% APR. Connect
            accounts for exact figures.
          </Typography>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Debt-free timelines
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap>
          {col("Minimum Payments", simMin)}
          {col("Your Current Pace", simUser)}
          {col("With Buffer", simBuffer, true)}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }} useFlexGap>
          <Typography variant="body2" color="text.secondary">
            {fmtMonthsRelative(simMin.monthsToZero - simBuffer.monthsToZero)} sooner with Buffer vs. minimums
          </Typography>
          <Typography variant="body2" fontWeight={600} color="primary">
            {fmtCurrency(Math.max(0, simMin.totalInterest - simBuffer.totalInterest), 0)} less interest vs. minimums
          </Typography>
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ borderLeft: `4px solid ${primary}` }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
          <Typography variant="body1" fontWeight={600}>
            {cohort}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Aggregate benchmark — your results depend on your full profile after linking accounts.
          </Typography>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Your cards
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
          Placeholders match the number of cards you indicated ({MOCK_PRE_CONNECTION_CARD_COUNT}) — illustrative until you
          connect.
        </Typography>
        <Stack spacing={1.25}>
          {Array.from({ length: MOCK_PRE_CONNECTION_CARD_COUNT }).map((_, i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{ borderStyle: "dashed", borderColor: "divider", bgcolor: "grey.50" }}
            >
              <CardContent sx={{ py: { xs: 2, lg: 2.5 }, px: { xs: 2, lg: 3 } }}>
                <Typography variant="body2" color="text.secondary">
                  Card {i + 1}: ? APR · ? Balance
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
        <Box sx={{ mt: 2 }}>
          <PlaidConnectButton variant="contained" color="primary" fullWidth sx={{ py: 1.25 }} onConnected={handlePlaidConnected}>
            Connect my accounts
          </PlaidConnectButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          Secure connection via Plaid (Canada). Sandbox: use <strong>user_good</strong> / <strong>pass_good</strong>.
        </Typography>
      </Box>

      {afford && simAfford ? (
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Affordable payment range
            </Typography>
            <Typography variant="body1">
              {fmtCurrency(afford.low, 0)}–{fmtCurrency(afford.high, 0)}/month based on your reported income
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              At {fmtCurrency(midPay!, 0)}/month on Buffer&apos;s illustrative rate, you could be debt-free by{" "}
              {fmtDate(simAfford.debtFreeDate)}.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
