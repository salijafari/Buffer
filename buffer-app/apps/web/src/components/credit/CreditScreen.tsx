'use client';

// Phase 4 — full implementation: SVG score gauge, history chart, graduation path, tradeline status, budgeting.

const SCORE_RANGES = [
  { label: 'Poor',      min: 300, max: 559,  color: '#FF6B6B' },
  { label: 'Fair',      min: 560, max: 659,  color: '#F59E0B' },
  { label: 'Good',      min: 660, max: 724,  color: '#60A5FA' },
  { label: 'Very Good', min: 725, max: 759,  color: '#34D399' },
  { label: 'Excellent', min: 760, max: 900,  color: '#00C9A7' },
];

function scoreLabel(score: number | null) {
  if (!score) return { label: '—', color: '#4A5568' };
  return SCORE_RANGES.find(r => score >= r.min && score <= r.max) ?? { label: '—', color: '#4A5568' };
}

export function CreditScreen() {
  const score: number | null = null; // TODO: from creditScoreStore

  const { label, color } = scoreLabel(score);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-white text-2xl font-bold">Credit</h1>
        <p className="text-[#8B9CB6] text-sm mt-1">Track and grow your credit score</p>
      </div>

      {/* Score gauge */}
      <div className="bg-[#1A1F2E] rounded-2xl p-6 flex flex-col items-center gap-3">
        {/* SVG arc gauge placeholder — full D3/SVG arc in Phase 4 */}
        <div
          className="w-40 h-20 rounded-t-full border-[10px] border-b-0 flex items-end justify-center pb-2"
          style={{ borderColor: color }}
        >
          <p className="text-white text-3xl font-bold font-mono leading-none">{score ?? '—'}</p>
        </div>
        <p className="font-semibold text-sm" style={{ color }}>{label}</p>
        <p className="text-[#4A5568] text-xs">Score updates monthly via Equifax</p>
      </div>

      {/* Score range legend */}
      <div className="bg-[#1A1F2E] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-[#8B9CB6] text-sm font-medium mb-1">Score ranges</p>
        {SCORE_RANGES.map(r => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-[#8B9CB6]">{r.label}</span>
            </div>
            <span className="text-[#4A5568] font-mono text-xs">{r.min}–{r.max}</span>
          </div>
        ))}
      </div>

      {/* Tradeline / Credit Builder status */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-[#8B9CB6] text-sm font-medium mb-3">Trade Lines</p>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#2A3040]" />
          <p className="text-[#4A5568] text-sm">No trade lines yet — complete setup to begin reporting</p>
        </div>
      </div>

      {/* History chart placeholder */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-[#8B9CB6] text-sm font-medium mb-4">Score History</p>
        <div className="h-32 flex items-center justify-center text-[#2A3040] text-sm">
          History chart renders in Phase 4
        </div>
      </div>
    </div>
  );
}
