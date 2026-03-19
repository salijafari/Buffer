'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { CreditScore } from '../../types/timeline';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORE_RANGES = [
  { label: 'Poor',      min: 300, max: 559,  color: '#FF6B6B' },
  { label: 'Fair',      min: 560, max: 659,  color: '#F59E0B' },
  { label: 'Good',      min: 660, max: 724,  color: '#60A5FA' },
  { label: 'Very Good', min: 725, max: 759,  color: '#34D399' },
  { label: 'Excellent', min: 760, max: 900,  color: '#00C9A7' },
] as const;

const SCORE_MIN = 300;
const SCORE_MAX = 900;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SCORE: CreditScore = {
  score: 682,
  band: 'fair',
  reportDate: '2026-03-01',
  bureau: 'equifax',
  history: [
    { month: 'Sep', score: 641 }, { month: 'Oct', score: 649 },
    { month: 'Nov', score: 658 }, { month: 'Dec', score: 665 },
    { month: 'Jan', score: 672 }, { month: 'Feb', score: 679 },
    { month: 'Mar', score: 682 },
  ],
};

const MOCK_TRADELINES = [
  { id: '1', type: 'Buffer Credit Builder', status: 'active',   reportedTo: 'Equifax & TransUnion', since: 'Jan 2026', payment: 'On time' },
  { id: '2', type: 'TD Cashback Visa',       status: 'external', reportedTo: 'Equifax',             since: 'Mar 2023', payment: 'On time' },
  { id: '3', type: 'Scotiabank Amex',        status: 'external', reportedTo: 'Equifax',             since: 'Aug 2021', payment: 'On time' },
];

const MOCK_BUDGET = [
  { category: 'Housing',      amount: 1800, pct: 36 },
  { category: 'Food',         amount: 620,  pct: 12 },
  { category: 'Transport',    amount: 280,  pct: 6  },
  { category: 'Subscriptions',amount: 140,  pct: 3  },
  { category: 'Other',        amount: 360,  pct: 7  },
  { category: 'Debt payments',amount: 700,  pct: 14 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBand(score: number) {
  return SCORE_RANGES.find(r => score >= r.min && score <= r.max)
    ?? SCORE_RANGES[SCORE_RANGES.length - 1];
}

function fmt$(n: number): string {
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
}

// ─── SVG Arc Gauge ────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const band = getBand(score);

  // Arc geometry: semicircle, 240° sweep
  const cx = 100, cy = 90, r = 75;
  const startAngle = -210; // degrees from right
  const totalSweep = 240;

  function polarToXY(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function arc(startDeg: number, endDeg: number) {
    const s = polarToXY(startDeg);
    const e = polarToXY(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  // Score normalised 0–1 within 300–900
  const pct = Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const needleDeg = startAngle + pct * totalSweep;
  const needleTip = polarToXY(needleDeg);

  // Band segments
  const segments = SCORE_RANGES.map(range => ({
    color: range.color,
    startDeg: startAngle + ((range.min - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * totalSweep,
    endDeg:   startAngle + ((range.max - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * totalSweep,
  }));

  return (
    <div className="flex flex-col items-center gap-1" role="img" aria-label={`Credit score gauge: ${score}, ${band.label}`}>
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]" aria-hidden="true">
        {/* Track */}
        <path
          d={arc(startAngle, startAngle + totalSweep)}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Coloured band segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={arc(seg.startDeg, seg.endDeg)}
            fill="none"
            stroke={seg.color}
            strokeWidth="10"
            strokeLinecap="butt"
            opacity={0.3}
          />
        ))}

        {/* Active arc up to needle */}
        <path
          d={arc(startAngle, needleDeg)}
          fill="none"
          stroke={band.color}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill="#0F172A" />

        {/* Score label */}
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="24"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {score}
        </text>
      </svg>

      {/* Band label */}
      <p className="text-sm font-semibold" style={{ color: band.color }}>{band.label}</p>

      {/* Range ticks */}
      <div className="flex justify-between w-full max-w-[220px] px-2 text-[10px] text-[#64748B] font-mono">
        <span>{SCORE_MIN}</span>
        <span>{SCORE_MAX}</span>
      </div>
    </div>
  );
}

// ─── History Tooltip ──────────────────────────────────────────────────────────

function HistoryTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs">
      <p className="text-[#475569]">{label}</p>
      <p className="text-[#00C9A7] font-bold font-mono">{payload[0].value}</p>
    </div>
  );
}

// ─── Graduation Progress ──────────────────────────────────────────────────────

function GraduationPath({ score }: { score: number }) {
  const TARGET = 660; // Good threshold
  const pct = Math.min(100, Math.round(((score - SCORE_MIN) / (TARGET - SCORE_MIN)) * 100));
  const remaining = Math.max(0, TARGET - score);
  const graduated = score >= TARGET;

  return (
    <div className="bg-white rounded-2xl p-5" aria-labelledby="graduation-heading">
      <h2 id="graduation-heading" className="text-[#475569] text-sm font-medium mb-3">
        {graduated ? 'Credit Line Unlocked' : 'Path to Credit Line'}
      </h2>

      {graduated ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🎉</span>
          <p className="text-[#00C9A7] text-sm font-medium">
            Your score qualifies for the Buffer Credit Line!
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#64748B]">Current: <span className="text-[#0F172A] font-mono">{score}</span></span>
            <span className="text-[#64748B]">Target: <span className="text-[#00C9A7] font-mono">{TARGET}+</span></span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: '#00C9A7' }}
            />
          </div>
          <p className="text-[#64748B] text-xs">
            {remaining} points to go · Typically {Math.ceil(remaining / 5)}–{Math.ceil(remaining / 3)} months with on-time payments
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreditScreen() {
  const [score] = useState<CreditScore>(MOCK_SCORE);
  const [activeTab, setActiveTab] = useState<'overview' | 'tradelines' | 'budget'>('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full" aria-busy="true" aria-label="Loading credit data">
        <div className="h-8 w-32 rounded-lg bg-white animate-pulse" />
        <div className="h-52 rounded-2xl bg-white animate-pulse" />
        <div className="h-24 rounded-2xl bg-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      <div>
        <h1 className="text-[#0F172A] text-2xl font-bold">Credit</h1>
        <p className="text-[#475569] text-sm mt-1">Track and grow your credit score</p>
      </div>

      {/* Score Card */}
      <section className="bg-white rounded-2xl p-5 flex flex-col items-center gap-4" aria-label="Credit score summary">
        <ScoreGauge score={score.score} />
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-[#64748B] text-xs">Bureau</p>
            <p className="text-[#0F172A] text-sm font-medium capitalize">{score.bureau}</p>
          </div>
          <div>
            <p className="text-[#64748B] text-xs">Updated</p>
            <p className="text-[#0F172A] text-sm font-medium">
              {new Date(score.reportDate).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[#64748B] text-xs">Next update</p>
            <p className="text-[#0F172A] text-sm font-medium">Apr 2026</p>
          </div>
        </div>
      </section>

      {/* Graduation path */}
      <GraduationPath score={score.score} />

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1" role="tablist" aria-label="Credit sections">
        {([
          { id: 'overview',   label: 'History' },
          { id: 'tradelines', label: 'Trade Lines' },
          { id: 'budget',     label: 'Budget' },
        ] as { id: typeof activeTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]',
              activeTab === tab.id ? 'bg-[#F8FAFC] text-[#0F172A]' : 'text-[#64748B] hover:text-[#475569]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: History */}
      {activeTab === 'overview' && (
        <section
          id="tabpanel-overview"
          role="tabpanel"
          aria-label="Score history"
          className="bg-white rounded-2xl p-5"
        >
          <h2 className="text-[#475569] text-sm font-medium mb-4">6-Month Score Trend</h2>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={score.history} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 20', 'dataMax + 20']}
                />
                <Tooltip content={<HistoryTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00C9A7"
                  strokeWidth={2.5}
                  dot={{ fill: '#00C9A7', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Score range legend */}
          <div className="mt-4 flex flex-col gap-1.5">
            {[...SCORE_RANGES].reverse().map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-[#475569] text-xs">{r.label}</span>
                </div>
                <span className="text-[#64748B] text-xs font-mono">{r.min}–{r.max}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Trade Lines */}
      {activeTab === 'tradelines' && (
        <section
          id="tabpanel-tradelines"
          role="tabpanel"
          aria-label="Trade lines"
          className="flex flex-col gap-3"
        >
          {MOCK_TRADELINES.map(tl => (
            <div key={tl.id} className="bg-white rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[#0F172A] text-sm font-medium">{tl.type}</p>
                <span className={[
                  'text-xs rounded-full px-2 py-0.5 font-medium flex-shrink-0',
                  tl.status === 'active'
                    ? 'bg-[#00C9A7]/10 text-[#00C9A7]'
                    : 'bg-[#E2E8F0] text-[#64748B]',
                ].join(' ')}>
                  {tl.status === 'active' ? 'Buffer' : 'External'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-[#64748B]">Reported to</p>
                  <p className="text-[#475569] mt-0.5">{tl.reportedTo}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Since</p>
                  <p className="text-[#475569] mt-0.5">{tl.since}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Payment</p>
                  <p className="text-[#00C9A7] mt-0.5">{tl.payment}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Tab: Budget */}
      {activeTab === 'budget' && (
        <section
          id="tabpanel-budget"
          role="tabpanel"
          aria-label="Monthly budget breakdown"
          className="bg-white rounded-2xl p-5"
        >
          <h2 className="text-[#475569] text-sm font-medium mb-4">Monthly Spending</h2>
          <div className="flex flex-col gap-3">
            {MOCK_BUDGET.map(item => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#475569]">{item.category}</span>
                  <span className="text-[#0F172A] font-mono">{fmt$(item.amount)}</span>
                </div>
                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.category === 'Debt payments' ? '#00C9A7' : '#3D4A5C',
                    }}
                  />
                </div>
                <p className="text-[#64748B] text-xs mt-0.5 text-right">{item.pct}% of income</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex justify-between">
            <span className="text-[#475569] text-sm">Total tracked</span>
            <span className="text-[#0F172A] font-bold font-mono">
              {fmt$(MOCK_BUDGET.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
