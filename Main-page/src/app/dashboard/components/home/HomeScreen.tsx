import { useState, useEffect } from "react";
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
    <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6" role="main" aria-label="Dashboard home">
      <section className="bg-gradient-to-br from-[#00C9A7]/12 via-white to-[#F0FDFA] border border-[#99F6E4] rounded-2xl p-5">
        <p className="text-[#00C9A7] text-xs font-bold uppercase tracking-widest mb-1">Debt-Free Date</p>
        <p className="text-[#0F172A] text-3xl font-bold">{fmtDate(timeline.future3!.debtFreeDate)}</p>
        <p className="text-[#475569] text-sm mt-1">
          {timeline.future3!.monthsToZero} months · <span className="text-[#00C9A7]">{fmtCurrency(timeline.interestSavings)}</span> interest saved
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[#64748B] text-xs mb-1">Net Worth</p>
          <p className={["text-xl font-bold font-mono tabular-nums", netWorth < 0 ? "text-[#FF6B6B]" : "text-[#00C9A7]"].join(" ")}>{fmtCurrency(netWorth)}</p>
          <p className="text-[#64748B] text-xs mt-1">{fmtCurrency(totalDebt)} debt</p>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[#64748B] text-xs mb-1">Credit Score</p>
          <p className="text-xl font-bold font-mono tabular-nums" style={{ color: scoreColor(score.band) }}>{score.score}</p>
          <p className="text-xs mt-1" style={{ color: scoreColor(score.band) }}>{scoreLabel(score.band)} · via {score.bureau}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#475569] text-sm font-medium">Your Cards</h2>
          <p className="text-[#64748B] text-xs font-mono">{fmtCurrency(totalDebt)} total · {utilPct(totalDebt, totalLimit)}% util</p>
        </div>
        <div className="flex flex-col gap-2">
          {cards.map((card) => {
            const util = utilPct(card.balance, card.limit);
            const utilBarColor = util > 80 ? "#FF6B6B" : util > 50 ? "#F59E0B" : "#00C9A7";
            return (
              <article key={card.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: card.color ?? "#94A3B8" }}>
                  {card.institution.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[#0F172A] text-sm font-medium truncate">{card.name}</p>
                    <p className="text-[#0F172A] text-sm font-bold font-mono tabular-nums flex-shrink-0">{fmtCurrency(card.balance)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${util}%`, backgroundColor: utilBarColor }} />
                    </div>
                    <p className="text-[#64748B] text-xs flex-shrink-0">{util}%</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SkeletonHome() {
  return (
    <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-36 rounded-2xl bg-white animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-white animate-pulse" />
        <div className="h-20 rounded-2xl bg-white animate-pulse" />
      </div>
      <div className="h-24 rounded-2xl bg-white animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />
      ))}
    </div>
  );
}
