import { useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
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
    <div className="bg-[#1A1F2E] border border-[#2A3040] rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-[#8B9CB6] mb-1.5">{fmtDate(label ?? 0)}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {fmtCurrencyCompact(p.value)}
        </p>
      ))}
    </div>
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPaymentChange?.(Number(e.target.value));
    },
    [onPaymentChange],
  );

  const currentPayment = adjustedPayment ?? sliderDefault ?? sliderMin;
  const totalBalance = future1.balanceArray[0] ? future1.balanceArray[0] + future1.monthlyPayment : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="h-52 w-full" role="img" aria-label="Debt-free timeline chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gF1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gF2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gF3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#4A5568", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtDate(v as number)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#4A5568", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtCurrencyCompact(v as number)}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="#2A3040" strokeDasharray="4 4" />

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
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <LegendItem color="#FF6B6B" label="Min payments" value={fmtMonths(future1.monthsToZero)} />
        {future2 && <LegendItem color="#F59E0B" label="Current pace" value={fmtMonths(future2.monthsToZero)} />}
        {future3 && <LegendItem color="#00C9A7" label="With Buffer" value={fmtMonths(future3.monthsToZero)} bold />}
      </div>

      {onPaymentChange && (
        <div className="bg-[#1A1F2E] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[#8B9CB6] text-sm font-medium">Monthly payment</p>
            <p className="text-[#00C9A7] font-bold font-mono text-lg">${currentPayment.toLocaleString("en-CA")}</p>
          </div>

          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={currentPayment}
            onChange={handleSlider}
            className="slider w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#2A3040]"
          />

          <div className="flex items-center justify-between text-xs text-[#4A5568]">
            <span className="font-mono">${sliderMin}/mo min</span>
            {future3 && <span className="text-[#00C9A7] font-mono">Debt-free {fmtDate(future3.monthsToZero)}</span>}
            <span className="font-mono">${sliderMax}/mo max</span>
          </div>
        </div>
      )}

      {future3 && (
        <SavingsCallout
          interestSaved={Math.max(0, future1.totalInterest - future3.totalInterest)}
          monthsSaved={Math.max(0, future1.monthsToZero - future3.monthsToZero)}
          totalBalance={totalBalance}
        />
      )}
    </div>
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
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className={["text-xs", bold ? "text-white font-semibold" : "text-[#4A5568]"].join(" ")}>{label}:</span>
      <span className={["text-xs font-mono", bold ? "text-[#00C9A7] font-bold" : "text-[#8B9CB6]"].join(" ")}>
        {value}
      </span>
    </div>
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
    <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/20 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl" aria-hidden="true">
        💡
      </span>
      <div>
        <p className="text-white text-sm font-semibold">
          Save <span className="text-[#00C9A7] font-mono">${Math.round(interestSaved).toLocaleString("en-CA")}</span>{" "}
          in interest
        </p>
        <p className="text-[#8B9CB6] text-xs mt-0.5">
          {fmtMonths(monthsSaved)} faster · {savingsPct.toFixed(0)}% less total cost
        </p>
      </div>
    </div>
  );
}
