import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { DebtFreeChart } from "../charts/DebtFreeChart";
import { FINANCE } from "../../lib/finance";
import { MOCK_TIMELINE } from "../../data/mockTimeline";
import { MOCK_CONNECTED_CARDS } from "../../data/mockDashboard";
import type { TimelineOutput, CardData, SimulationResult } from "../../types/timeline";
import { fmtCurrency } from "../../lib/dashboardFormat";

export type PayoffRailMetrics = {
  interestSaved: number;
  monthsSaved: number;
  totalBalance: number;
};

function calcFuture3Only(balance: number, bufferAPR: number, payment: number): SimulationResult {
  const rate = bufferAPR / 12;
  const balanceArray: number[] = [];
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  while (bal > 0 && months < 1200) {
    const interest = bal * rate;
    const paid = Math.min(payment, bal + interest);
    bal = bal + interest - paid;
    totalInterest += interest;
    totalPaid += paid;
    months++;
    balanceArray.push(Math.max(0, bal));
    if (paid <= interest && bal > 0) break;
  }
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  return { monthsToZero: months, totalInterest, totalPaid, balanceArray, debtFreeDate, monthlyPayment: payment };
}

export function PayoffPostConnection({
  onPayoffMetrics,
}: {
  onPayoffMetrics?: (m: PayoffRailMetrics | null) => void;
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [timeline, setTimeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [adjustedPayment, setAdjustedPayment] = useState(MOCK_TIMELINE.recommendedPayment);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAmountErr, setTransferAmountErr] = useState("");
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");
  const [autoTransfer, setAutoTransfer] = useState(false);

  const cards = MOCK_CONNECTED_CARDS;
  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);

  const handlePaymentChange = useCallback(
    (payment: number) => {
      setAdjustedPayment(payment);
      const newF3 = calcFuture3Only(totalDebt, FINANCE.BUFFER_APR_DEFAULT, payment);
      setTimeline((prev) => ({ ...prev, future3: newF3 }));
    },
    [totalDebt],
  );

  useEffect(() => {
    if (!onPayoffMetrics) return;
    const f1 = timeline.future1;
    const f3 = timeline.future3;
    if (!f3) {
      onPayoffMetrics(null);
      return;
    }
    const totalBalance = f1.balanceArray[0] ? f1.balanceArray[0] + f1.monthlyPayment : 0;
    onPayoffMetrics({
      interestSaved: Math.max(0, f1.totalInterest - f3.totalInterest),
      monthsSaved: Math.max(0, f1.monthsToZero - f3.monthsToZero),
      totalBalance,
    });
  }, [timeline, onPayoffMetrics]);

  function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!selectedCard) return;
    if (!transferAmount || Number.isNaN(amount) || amount <= 0) {
      setTransferAmountErr("Enter a valid amount");
      return;
    }
    if (amount > selectedCard.balance) {
      setTransferAmountErr(`Max ${fmtCurrency(selectedCard.balance, 2)}`);
      return;
    }
    setTransferAmountErr("");
    setTransferAmount("");
  }

  const sortedForStrategy = [...cards].sort((a, b) => {
    if (strategy === "snowball") return a.balance - b.balance;
    return (b.apr ?? 0) - (a.apr ?? 0);
  });

  const transferCentre = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2, sm: 2.5, lg: 3 } } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Transfer centre
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Mock UI — select a card and amount to move to your Buffer line (VoPay when live).
        </Typography>
        <Box component="form" onSubmit={handleTransferSubmit}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              {cards.map((card) => {
                const sel = selectedCard?.id === card.id;
                return (
                  <Button
                    key={card.id}
                    type="button"
                    fullWidth
                    onClick={() => setSelectedCard((prev) => (prev?.id === card.id ? null : card))}
                    variant={sel ? "contained" : "outlined"}
                    color={sel ? "primary" : "inherit"}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      py: 1.5,
                      px: 1.5,
                      borderColor: "divider",
                      ...(sel ? {} : { bgcolor: "background.paper", color: "text.primary" }),
                    }}
                  >
                    <Avatar variant="rounded" sx={{ width: 32, height: 32, mr: 1.5, bgcolor: card.color ?? "#94A3B8", fontSize: "0.7rem", fontWeight: 700 }}>
                      {card.institution.slice(0, 2)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {card.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="ui-monospace, monospace" display="block">
                        ••••{card.last4} · {fmtCurrency(card.balance)} balance
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Stack>
            <TextField
              type="number"
              inputProps={{ inputMode: "decimal", min: 10, step: "0.01" }}
              value={transferAmount}
              onChange={(e) => {
                setTransferAmount(e.target.value);
                setTransferAmountErr("");
              }}
              placeholder="Transfer amount"
              error={Boolean(transferAmountErr)}
              helperText={transferAmountErr || undefined}
              fullWidth
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Transfer total (mock): enter amount above · New debt-free date tracks in Overview when live.
            </Typography>
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={!selectedCard}>
              Transfer now
            </Button>
            <FormControlLabel control={<Switch checked={autoTransfer} onChange={(_, c) => setAutoTransfer(c)} />} label="Auto-transfer new balances (mock)" />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const strategyCard = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Active payoff strategy
        </Typography>
        <ToggleButtonGroup exclusive value={strategy} onChange={(_, v) => v && setStrategy(v)} size="small" sx={{ mb: 2 }}>
          <ToggleButton value="snowball">Snowball</ToggleButton>
          <ToggleButton value="avalanche">Avalanche</ToggleButton>
        </ToggleButtonGroup>
        <Stack spacing={1}>
          {sortedForStrategy.map((c) => (
            <Box key={c.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                  {c.name}
                </Typography>
                <Typography variant="caption" fontFamily="ui-monospace, monospace">
                  {fmtCurrency(c.balance, 0)}
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={65} sx={{ mt: 0.5, height: 6, borderRadius: 999, "& .MuiLinearProgress-bar": { bgcolor: primary } }} />
            </Box>
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          Avalanche saves you ~$420 more (mock). Snowball pays off your first card ~2 months sooner (mock).
        </Typography>
      </CardContent>
    </Card>
  );

  const scheduleCard = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Payment schedule (next 30 days)
        </Typography>
        <Stack spacing={1}>
          {[
            { who: "Buffer autopay", amt: 430, date: "Mar 15", tone: "primary" as const },
            { who: "TD minimum", amt: 136, date: "Mar 18", tone: "default" as const },
            { who: "Scotiabank minimum", amt: 64, date: "Mar 22", tone: "default" as const },
          ].map((row) => (
            <Stack key={row.who} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="body2" color={row.tone === "primary" ? "primary" : "text.primary"} fontWeight={row.tone === "primary" ? 600 : 400}>
                {row.who}
              </Typography>
              <Typography variant="body2" fontFamily="ui-monospace, monospace">
                {fmtCurrency(row.amt, 0)} · {row.date}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const bufferDetail = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Buffer line (detailed)
        </Typography>
        <LinearProgress variant="determinate" value={65} sx={{ height: 10, borderRadius: 999, mb: 2, "& .MuiLinearProgress-bar": { bgcolor: primary } }} />
        <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
          {[
            ["Balance", fmtCurrency(7800, 0)],
            ["Limit", fmtCurrency(12_000, 0)],
            ["APR", "15.5%"],
            ["Utilization", "65%"],
          ].map(([k, v]) => (
            <Box key={k}>
              <Typography variant="caption" color="text.secondary">
                {k}
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {v}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ["Feb 15", 430, "Paid"],
              ["Jan 15", 430, "Paid"],
              ["Dec 15", 410, "Paid"],
            ].map(([d, a, s]) => (
              <TableRow key={String(d)}>
                <TableCell>{d}</TableCell>
                <TableCell align="right">{fmtCurrency(Number(a), 0)}</TableCell>
                <TableCell>{s}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outlined" sx={{ mt: 2 }} disabled>
          Increase my limit
        </Button>
      </CardContent>
    </Card>
  );

  const history = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Transfer history
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          3 transfers · $4,200 transferred · $612 saved (mock)
        </Typography>
        {[
          { date: "Jan 8", card: "TD Cashback Visa", amt: 1200, detail: "19.99% → 15.5% · ~$38/mo savings" },
          { date: "Dec 2", card: "Scotiabank Gold", amt: 800, detail: "21.14% → 15.5% · ~$37/mo savings" },
        ].map((row, i) => (
          <Accordion key={i} disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1, mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography variant="body2">
                {row.date} · {row.card} · {fmtCurrency(row.amt, 0)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" color="text.secondary">
                {row.detail}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );

  const chartCard = (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2, sm: 2.5, lg: 3 } } }}>
        <DebtFreeChart
          future1={timeline.future1}
          future2={timeline.future2}
          future3={timeline.future3}
          adjustedPayment={adjustedPayment}
          onPaymentChange={handlePaymentChange}
          sliderMin={210}
          sliderMax={1400}
          sliderStep={10}
          sliderDefault={timeline.recommendedPayment}
          hideSavingsCallout={isDesktop}
        />
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
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Payoff Planner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Accelerate your path to debt freedom
        </Typography>
      </Box>

      {transferCentre}

      {isDesktop ? (
        <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
          <Stack spacing={3} sx={{ flex: "1 1 60%", minWidth: 0 }}>
            {chartCard}
            {strategyCard}
            {scheduleCard}
            {bufferDetail}
            {history}
          </Stack>
        </Stack>
      ) : (
        <>
          {chartCard}
          {strategyCard}
          {scheduleCard}
          {bufferDetail}
          {history}
        </>
      )}
    </Stack>
  );
}
