import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DebtFreeChart } from "../charts/DebtFreeChart";
import { FINANCE } from "../../lib/finance";
import { MOCK_TIMELINE } from "../../data/mockTimeline";
import type { TimelineOutput, CardData, SimulationResult } from "../../types/timeline";

const MOCK_CARDS: CardData[] = [
  { id: "1", name: "TD Cashback Visa", last4: "4242", balance: 6800, apr: 0.1999, limit: 10000, institution: "TD", color: "#00A651" },
  { id: "2", name: "Scotiabank Gold Amex", last4: "8891", balance: 3200, apr: 0.2114, limit: 5000, institution: "BNS", color: "#EC0926" },
  { id: "3", name: "CIBC Visa Dividend", last4: "3377", balance: 1500, apr: 0.1999, limit: 3000, institution: "CIBC", color: "#C31E2E" },
];

export type PayoffRailMetrics = {
  interestSaved: number;
  monthsSaved: number;
  totalBalance: number;
};

function fmtCurrency(n: number, d = 0): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

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

export function PayoffScreen({
  onPayoffMetrics,
}: {
  onPayoffMetrics?: (m: PayoffRailMetrics | null) => void;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [timeline, setTimeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [adjustedPayment, setAdjustedPayment] = useState(MOCK_TIMELINE.recommendedPayment);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAmountErr, setTransferAmountErr] = useState("");

  const totalDebt = MOCK_CARDS.reduce((s, c) => s + c.balance, 0);
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

  const paymentForm = (
    <Card variant="outlined" sx={{ height: isDesktop ? "fit-content" : undefined }}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5, lg: 3 },
          "&:last-child": { pb: { xs: 2, sm: 2.5, lg: 3 } },
        }}
      >
        <Typography variant="body2" fontWeight={500} color="text.secondary" gutterBottom>
          Make a Payment
        </Typography>
        <Box component="form" onSubmit={handleTransferSubmit} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              {MOCK_CARDS.map((card) => {
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
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        bgcolor: card.color ?? "#94A3B8",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
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
              placeholder="Payment amount"
              error={Boolean(transferAmountErr)}
              helperText={transferAmountErr || undefined}
              fullWidth
              size="small"
            />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={!selectedCard}>
              {selectedCard ? `Pay ${selectedCard.name}` : "Select a card"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const chartCard = (
    <Card variant="outlined">
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5, lg: 3 },
          "&:last-child": { pb: { xs: 2, sm: 2.5, lg: 3 } },
        }}
      >
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
        maxWidth: { xs: 672, lg: "none" },
        mx: "auto",
        width: "100%",
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

      {isDesktop ? (
        <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
          <Stack spacing={3} sx={{ flex: "1 1 60%", minWidth: 0 }}>
            {chartCard}
          </Stack>
          <Box sx={{ flex: "1 1 40%", minWidth: 0, position: "sticky", top: 16 }}>{paymentForm}</Box>
        </Stack>
      ) : (
        <>
          {chartCard}
          {paymentForm}
        </>
      )}
    </Stack>
  );
}
