import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Slider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { PlaidConnectButton } from "../plaid/PlaidConnectButton";
import { FINANCE } from "../../lib/finance";
import {
  canadianMinimumMonthlyPayment,
  estimatedAprFromCreditScore,
  simulateAggregatePayoff,
} from "../../lib/dashboardFormulas";
import { fmtCurrency, fmtDate } from "../../lib/dashboardFormat";
import { MOCK_ILLUSTRATIVE_DEBT, MOCK_ILLUSTRATIVE_MONTHLY_PAYMENT, MOCK_PRE_CONNECTION_CARD_COUNT } from "../../data/mockDashboard";

export function PayoffPreConnection() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { profile, refreshPlaidConnection, refreshProfile } = useDashboardShell();

  const handlePlaidConnected = () => {
    void Promise.all([refreshPlaidConnection(), refreshProfile()]);
  };

  const defaultApr = estimatedAprFromCreditScore(profile?.credit_score ?? null);
  const [debt, setDebt] = useState(MOCK_ILLUSTRATIVE_DEBT);
  const [payment, setPayment] = useState(MOCK_ILLUSTRATIVE_MONTHLY_PAYMENT);
  const [apr, setApr] = useState(defaultApr);

  const minPayFloor = useMemo(() => canadianMinimumMonthlyPayment(debt, apr), [debt, apr]);

  const currentSim = useMemo(() => simulateAggregatePayoff(debt, apr, payment), [debt, apr, payment]);
  const bufferSim = useMemo(
    () => simulateAggregatePayoff(debt, FINANCE.BUFFER_APR_MIDPOINT, payment),
    [debt, payment],
  );

  const savedInterest = Math.max(0, currentSim.totalInterest - bufferSim.totalInterest);
  const savedMonths = Math.max(0, currentSim.monthsToZero - bufferSim.monthsToZero);

  const comparisonCol = (title: string, sim: typeof currentSim, highlight?: boolean) => (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0, borderColor: highlight ? "primary.main" : "divider", bgcolor: highlight ? `${theme.palette.primary.main}0d` : undefined }}>
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Typography variant="subtitle2" fontWeight={700} color={highlight ? "primary" : "text.secondary"} gutterBottom>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Debt-free
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {fmtDate(sim.debtFreeDate)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Interest: {fmtCurrency(sim.totalInterest, 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total paid: {fmtCurrency(sim.totalPaid, 0)}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Stack
      spacing={{ xs: 2.5, lg: 3 }}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: { lg: "none" } }}>
        <Typography variant="h5" fontWeight={700}>
          Payoff Planner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Explore scenarios before you connect accounts
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Interactive payoff calculator
          </Typography>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total debt: {fmtCurrency(debt, 0)}
              </Typography>
              <Slider min={1000} max={100_000} step={500} value={debt} onChange={(_, v) => setDebt(Array.isArray(v) ? v[0] : v)} valueLabelDisplay="auto" valueLabelFormat={(x) => `$${x / 1000}k`} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monthly payment: {fmtCurrency(payment, 0)} (min floor ~{fmtCurrency(minPayFloor, 0)})
              </Typography>
              <Slider min={Math.max(50, Math.floor(minPayFloor))} max={5000} step={10} value={payment} onChange={(_, v) => setPayment(Array.isArray(v) ? v[0] : v)} valueLabelDisplay="auto" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estimated APR: {(apr * 100).toFixed(1)}% · Buffer midpoint {(FINANCE.BUFFER_APR_MIDPOINT * 100).toFixed(1)}%
              </Typography>
              <Slider min={0.1} max={0.32} step={0.005} value={apr} onChange={(_, v) => setApr(Array.isArray(v) ? v[0] : v)} valueLabelDisplay="auto" valueLabelFormat={(x) => `${(x * 100).toFixed(1)}%`} />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }} useFlexGap>
            {comparisonCol("Current rate", currentSim)}
            {comparisonCol("With Buffer", bufferSim, true)}
          </Stack>
          <Typography variant="body2" fontWeight={600} color="primary" sx={{ mt: 2 }}>
            Save {fmtCurrency(savedInterest, 0)} interest · {savedMonths} months sooner (illustrative)
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Snowball vs avalanche
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} divider={isDesktop ? <Divider orientation="vertical" flexItem /> : <Divider />}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Snowball
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Pay smallest balance first for quick wins — great for motivation with {MOCK_PRE_CONNECTION_CARD_COUNT} cards.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Avalanche
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Target highest APR first to minimize total interest — often saves more vs snowball on the same payment.
              </Typography>
            </Box>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            Connect your cards to see which strategy saves you the most based on your actual balances.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderLeft: 4, borderColor: "primary.main" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="body1" fontWeight={600}>
            Buffer members get a credit line at {(FINANCE.BUFFER_APR_MIN * 100).toFixed(0)}–{(FINANCE.BUFFER_APR_MAX * 100).toFixed(0)}% APR — connect your accounts to see your rate.
          </Typography>
          <PlaidConnectButton variant="contained" color="primary" sx={{ mt: 2 }} onConnected={handlePlaidConnected}>
            Connect my accounts
          </PlaidConnectButton>
        </CardContent>
      </Card>
    </Stack>
  );
}
