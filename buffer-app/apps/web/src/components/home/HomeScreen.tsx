'use client';

// Phase 3 — full implementation coming in next phase.
// Renders: Debt-Free Hero · Progress Chart · Net Worth · Cards Feed ·
//          Credit Line Status · Credit Score Gauge · AI Banner · Rewards Points

export function HomeScreen() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Debt-Free Hero placeholder */}
      <section className="bg-gradient-to-br from-[#00C9A7]/20 to-[#0F1117] border border-[#00C9A7]/20 rounded-2xl p-6">
        <p className="text-[#00C9A7] text-xs font-semibold uppercase tracking-widest mb-1">Debt-Free Date</p>
        <p className="text-white text-4xl font-bold font-mono">— —</p>
        <p className="text-[#4A5568] text-sm mt-1">Connect your cards to calculate</p>
      </section>

      {/* Progress chart placeholder */}
      <section className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-[#8B9CB6] text-sm font-medium mb-4">Payoff progress</p>
        <div className="h-40 flex items-center justify-center text-[#2A3040] text-sm">
          Chart loads in Phase 3
        </div>
      </section>

      {/* Net worth & credit score */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A1F2E] rounded-2xl p-4">
          <p className="text-[#4A5568] text-xs mb-1">Net Worth</p>
          <p className="text-white text-xl font-bold font-mono">$—</p>
        </div>
        <div className="bg-[#1A1F2E] rounded-2xl p-4">
          <p className="text-[#4A5568] text-xs mb-1">Credit Score</p>
          <p className="text-white text-xl font-bold font-mono">—</p>
        </div>
      </div>

      {/* AI Banner */}
      <section className="bg-[#1A1F2E] border border-[#2A3040] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/10 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">Ask Buffer AI</p>
          <p className="text-[#4A5568] text-xs truncate">Get personalized payoff advice</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </section>
    </div>
  );
}
