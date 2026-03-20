import { useCallback, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Paper, Slider, Stack, Typography } from "@mui/material";
import type { SimulationResult } from "../../types/timeline";

interface DebtFreeChartProps {
  future1: SimulationResult;
  future2: SimulationResult | null;
  future3: SimulationResult | null;
  adjustedPayment?: number;
  onPaymentChange?: (payment: number) => void;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderDefault?: number;
}

interface ChartPoint {
  month: number;
  f1: number | null;
  f2: number | null;
  f3: number | null;
}

function fmtCurrencyCompact(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${Math.round(v)}`;
}

function fmtDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short" });
}

function fmtMonths(m: number): string {
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (yrs === 0) return `${mos}mo`;
  if (mos === 0) return `${yrs}yr`;
  return `${yrs}yr ${mos}mo`;
}

function buildChartData(
  f1: SimulationResult,
  f2: SimulationResult | null,
  f3: SimulationResult | null,
): ChartPoint[] {
  const len = Math.max(
    f1.balanceArray.length,
    f2?.balanceArray.length ?? 0,
    f3?.balanceArray.length ?? 0,
  );

  return Array.from({ length: len }, (_, i) => ({
    month: i + 1,
    f1: i < f1.balanceArray.length ? f1.balanceArray[i] : null,
    f2: f2 && i < f2.balanceArray.length ? f2.balanceArray[i] : null,
    f3: f3 && i < f3.balanceArray.length ? f3.balanceArray[i] : null,
  }));
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={4} sx={{ px: 1.5, py: 1, border: 1, borderColor: "divider" }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {fmtDate(label ?? 0)}
      </Typography>
      {payload.map((p) => (
        <Typography key={p.name} variant="caption" fontFamily="ui-monospace, monospace" fontWeight={600} sx={{ color: p.color }} display="block">
          {p.name}: {fmtCurrencyCompact(p.value)}
        </Typography>
      ))}
    </Paper>
  );
}

export function DebtFreeChart({
  future1,
  future2,
  future3,
  adjustedPayment,
  onPaymentChange,
  sliderMin = 100,
  sliderMax = 2000,
  sliderStep = 10,
  sliderDefault,
}: DebtFreeChartProps) {
  const data = useMemo(() => buildChartData(future1, future2, future3), [future1, future2, future3]);

  const handleSlider = useCallback(
    (_: Event, value: number | number[]) => {
      const v = Array.isArray(value) ? value[0] : value;
      onPaymentChange?.(v);
    },
    [onPaymentChange],
  );

  const currentPayment = adjustedPayment ?? sliderDefault ?? sliderMin;
  const totalBalance = future1.balanceArray[0] ? future1.balanceArray[0] + future1.monthlyPayment : 0;

  return (
    <Stack spacing={2}>
      <Box sx={{ height: 208, width: "100%" }} role="img" aria-label="Debt-free timeline chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gF1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gF2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gF3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748B", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtDate(v as number)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtCurrencyCompact(v as number)}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="4 4" />

            <Area
              type="monotone"
              dataKey="f1"
              name="Min payments"
              stroke="#FF6B6B"
              strokeWidth={1.5}
              fill="url(#gF1)"
              dot={false}
              connectNulls={false}
              strokeDasharray="4 3"
            />
            {future2 && (
              <Area
                type="monotone"
                dataKey="f2"
                name="Current pace"
                stroke="#F59E0B"
                strokeWidth={1.5}
                fill="url(#gF2)"
                dot={false}
                connectNulls={false}
              />
            )}
            {future3 && (
              <Area
                type="monotone"
                dataKey="f3"
                name="With Buffer"
                stroke="#00C9A7"
                strokeWidth={2.5}
                fill="url(#gF3)"
                dot={false}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
        <LegendItem color="#FF6B6B" label="Min payments" value={fmtMonths(future1.monthsToZero)} />
        {future2 && <LegendItem color="#F59E0B" label="Current pace" value={fmtMonths(future2.monthsToZero)} />}
        {future3 && <LegendItem color="#00C9A7" label="With Buffer" value={fmtMonths(future3.monthsToZero)} bold />}
      </Stack>

      {onPaymentChange && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Monthly payment
              </Typography>
              <Typography variant="h6" fontWeight={700} fontFamily="ui-monospace, monospace" color="primary.main">
                ${currentPayment.toLocaleString("en-CA")}
              </Typography>
            </Stack>

            <Slider
              value={currentPayment}
              onChange={handleSlider}
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              valueLabelDisplay="auto"
              aria-label="Monthly payment"
              sx={{
                color: "primary.main",
                "& .MuiSlider-thumb": { width: 18, height: 18 },
              }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontFamily="ui-monospace, monospace">
                ${sliderMin}/mo min
              </Typography>
              {future3 && (
                <Typography variant="caption" color="primary.main" fontFamily="ui-monospace, monospace" fontWeight={600}>
                  Debt-free {fmtDate(future3.monthsToZero)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" fontFamily="ui-monospace, monospace">
                ${sliderMax}/mo max
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {future3 && (
        <SavingsCallout
          interestSaved={Math.max(0, future1.totalInterest - future3.totalInterest)}
          monthsSaved={Math.max(0, future1.monthsToZero - future3.monthsToZero)}
          totalBalance={totalBalance}
        />
      )}
    </Stack>
  );
}

function LegendItem({
  color,
  label,
  value,
  bold = false,
}: {
  color: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} useFlexGap>
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="caption" color={bold ? "text.primary" : "text.secondary"} fontWeight={bold ? 600 : 400}>
        {label}:
      </Typography>
      <Typography variant="caption" fontFamily="ui-monospace, monospace" fontWeight={bold ? 700 : 500} color={bold ? "primary.main" : "text.secondary"}>
        {value}
      </Typography>
    </Stack>
  );
}

function SavingsCallout({
  interestSaved,
  monthsSaved,
  totalBalance,
}: {
  interestSaved: number;
  monthsSaved: number;
  totalBalance: number;
}) {
  if (interestSaved < 10) return null;
  const savingsPct = totalBalance > 0 ? (interestSaved / totalBalance) * 100 : 0;
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: (t) => `${t.palette.primary.main}14`,
        borderColor: (t) => `${t.palette.primary.main}40`,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
      }}
    >
      <Typography component="span" sx={{ fontSize: "1.5rem" }} aria-hidden>
        💡
      </Typography>
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Save{" "}
          <Box component="span" sx={{ color: "primary.main", fontFamily: "ui-monospace, monospace" }}>
            ${Math.round(interestSaved).toLocaleString("en-CA")}
          </Box>{" "}
          in interest
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          {fmtMonths(monthsSaved)} faster · {savingsPct.toFixed(0)}% less total cost
        </Typography>
      </Box>
    </Paper>
  );
}
