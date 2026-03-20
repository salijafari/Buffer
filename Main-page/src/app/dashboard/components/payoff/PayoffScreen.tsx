import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import { DebtFreeChart } from "../charts/DebtFreeChart";
import { FINANCE } from "../../lib/finance";
import type { TimelineOutput, CardData, SimulationResult } from "../../types/timeline";

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

export function PayoffScreen() {
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

  return (
    <Stack spacing={2.5} sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%" }}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Payoff Planner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Accelerate your path to debt freedom
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
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
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
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
    </Stack>
  );
}
