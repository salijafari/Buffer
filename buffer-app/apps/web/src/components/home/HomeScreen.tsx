'use client';

import { useState, useEffect } from 'react';
import type { TimelineOutput, CardData, CreditScore } from '../../types/timeline';

// ─── Mock data (replaced by Zustand stores in production) ─────────────────────

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
  { id: '1', name: 'TD Cashback Visa',     last4: '4242', balance: 6800, apr: 0.1999, limit: 10000, institution: 'TD',   color: '#00A651' },
  { id: '2', name: 'Scotiabank Gold Amex', last4: '8891', balance: 3200, apr: 0.2114, limit: 5000,  institution: 'BNS',  color: '#EC0926' },
  { id: '3', name: 'CIBC Visa Dividend',   last4: '3377', balance: 1500, apr: 0.1999, limit: 3000,  institution: 'CIBC', color: '#C31E2E' },
];

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(n: number, decimals = 0): string {
  return n.toLocaleString('en-CA', {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long' });
}

function utilPct(balance: number, limit: number): number {
  return limit > 0 ? Math.round((balance / limit) * 100) : 0;
}

function scoreColor(band: CreditScore['band']): string {
  const map: Record<CreditScore['band'], string> = {
    poor: '#FF6B6B', fair: '#F59E0B', good: '#60A5FA',
    very_good: '#34D399', excellent: '#00C9A7',
  };
  return map[band];
}

function scoreLabel(band: CreditScore['band']): string {
  const map: Record<CreditScore['band'], string> = {
    poor: 'Poor', fair: 'Fair', good: 'Good',
    very_good: 'Very Good', excellent: 'Excellent',
  };
  return map[band];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const [timeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [cards]    = useState<CardData[]>(MOCK_CARDS);
  const [score]    = useState<CreditScore>(MOCK_SCORE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const totalDebt  = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const netWorth   = -totalDebt;

  if (!isLoaded) return <SkeletonHome />;

  return (
    <div
      className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"
      role="main"
      aria-label="Dashboard home"
    >
      {/* ── Debt-Free Hero ──────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-br from-[#00C9A7]/12 via-white to-[#F0FDFA] border border-[#99F6E4] rounded-2xl p-5"
        aria-labelledby="hero-heading"
      >
        <p id="hero-heading" className="text-[#00C9A7] text-xs font-bold uppercase tracking-widest mb-1">
          Debt-Free Date
        </p>
        <p className="text-[#0F172A] text-3xl font-bold">
          {fmtDate(timeline.future3!.debtFreeDate)}
        </p>
        <p className="text-[#475569] text-sm mt-1">
          {timeline.future3!.monthsToZero} months ·{' '}
          <span className="text-[#00C9A7]">{fmt$(timeline.interestSavings)}</span> interest saved
        </p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
            <span>Today</span>
            <span className="text-[#00C9A7]">
              {Math.round((timeline.future3!.monthsToZero / timeline.future1.monthsToZero) * 100 - 100 + 100)}% faster
            </span>
            <span>Debt-free</span>
          </div>
          <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00C9A7] to-[#00C9A7]/60 rounded-full"
              style={{ width: '3%' }}
            />
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 bg-[#00C9A7]/10 rounded-full px-3 py-1">
          <span className="text-[#00C9A7] text-xs font-semibold">
            🚀 {timeline.yearsSaved.toFixed(1)} yrs faster than minimum payments
          </span>
        </div>
      </section>

      {/* ── Net Worth + Credit Score ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4" aria-label={`Net worth: ${fmt$(netWorth)}`}>
          <p className="text-[#64748B] text-xs mb-1">Net Worth</p>
          <p className={['text-xl font-bold font-mono tabular-nums', netWorth < 0 ? 'text-[#FF6B6B]' : 'text-[#00C9A7]'].join(' ')}>
            {fmt$(netWorth)}
          </p>
          <p className="text-[#64748B] text-xs mt-1">{fmt$(totalDebt)} debt</p>
        </div>

        <div className="bg-white rounded-2xl p-4" aria-label={`Credit score ${score.score}, ${scoreLabel(score.band)}`}>
          <p className="text-[#64748B] text-xs mb-1">Credit Score</p>
          <p className="text-xl font-bold font-mono tabular-nums" style={{ color: scoreColor(score.band) }}>
            {score.score}
          </p>
          <p className="text-xs mt-1" style={{ color: scoreColor(score.band) }}>
            {scoreLabel(score.band)} · via {score.bureau}
          </p>
        </div>
      </div>

      {/* ── Buffer Credit Line ──────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-4" aria-labelledby="credit-line-heading">
        <div className="flex items-center justify-between mb-3">
          <p id="credit-line-heading" className="text-[#475569] text-sm font-medium">Buffer Credit Line</p>
          <span className="text-xs bg-[#00C9A7]/10 text-[#00C9A7] rounded-full px-2.5 py-0.5 font-medium">
            Active
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-[#0F172A] text-2xl font-bold font-mono tabular-nums">$5,000</p>
          <p className="text-[#64748B] text-sm">available</p>
        </div>
        <div className="mt-2 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-[#00C9A7] rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-[#64748B] text-xs mt-1.5">$0 used · 14.99% APR</p>
      </section>

      {/* ── Cards Feed ─────────────────────────────────────────────────── */}
      <section aria-labelledby="cards-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="cards-heading" className="text-[#475569] text-sm font-medium">Your Cards</h2>
          <p className="text-[#64748B] text-xs font-mono">{fmt$(totalDebt)} total · {utilPct(totalDebt, totalLimit)}% util</p>
        </div>

        <div className="flex flex-col gap-2">
          {cards.map(card => {
            const util = utilPct(card.balance, card.limit);
            const utilBarColor = util > 80 ? '#FF6B6B' : util > 50 ? '#F59E0B' : '#00C9A7';
            return (
              <article
                key={card.id}
                className="bg-white rounded-xl p-4 flex items-center gap-3"
                aria-label={`${card.name}: ${fmt$(card.balance)} balance, ${util}% utilization`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: card.color ?? '#94A3B8' }}
                  aria-hidden="true"
                >
                  {card.institution.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[#0F172A] text-sm font-medium truncate">{card.name}</p>
                    <p className="text-[#0F172A] text-sm font-bold font-mono tabular-nums flex-shrink-0">
                      {fmt$(card.balance)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${util}%`, backgroundColor: utilBarColor }}
                      />
                    </div>
                    <p className="text-[#64748B] text-xs flex-shrink-0">
                      {util}%
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Rewards ──────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-4 flex items-center gap-4" aria-label="Rewards: 1,250 points">
        <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl" aria-hidden="true">⭐</span>
        </div>
        <div className="flex-1">
          <p className="text-[#64748B] text-xs">Rewards Points</p>
          <p className="text-[#0F172A] font-bold font-mono tabular-nums text-lg">1,250 pts</p>
        </div>
        <p className="text-[#64748B] text-xs">≈ $12.50</p>
      </section>

      {/* ── AI Banner ────────────────────────────────────────────────────── */}
      <a
        href="/ai"
        className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-4 hover:border-[#00C9A7]/30 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
        aria-label="Open Buffer AI assistant"
      >
        <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00C9A7]/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#0F172A] text-sm font-medium">Ask Buffer AI</p>
          <p className="text-[#64748B] text-xs mt-0.5 truncate">
            &ldquo;How can I pay off my TD card faster?&rdquo;
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="group-hover:stroke-[#00C9A7] transition-colors flex-shrink-0">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonHome() {
  return (
    <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full" aria-busy="true" aria-label="Loading dashboard">
      <div className="skeleton h-36 rounded-2xl bg-white animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-20 rounded-2xl bg-white animate-pulse" />
        <div className="skeleton h-20 rounded-2xl bg-white animate-pulse" />
      </div>
      <div className="skeleton h-24 rounded-2xl bg-white animate-pulse" />
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton h-16 rounded-xl bg-white animate-pulse" />
      ))}
    </div>
  );
}
