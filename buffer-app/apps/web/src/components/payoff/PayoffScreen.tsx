'use client';

// Phase 3 — full implementation: card selection, transfer confirmation, automation controls, DebtFreeChart.

export function PayoffScreen() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-white text-2xl font-bold">Payoff Planner</h1>
        <p className="text-[#8B9CB6] text-sm mt-1">Accelerate your path to debt freedom</p>
      </div>

      {/* Chart placeholder */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-[#8B9CB6] text-sm font-medium mb-4">Debt-Free Timeline</p>
        <div className="h-48 flex items-center justify-center text-[#2A3040] text-sm">
          DebtFreeChart renders in Phase 3
        </div>
        <div className="flex gap-4 mt-4">
          {[
            { label: 'Minimum Only', color: '#FF6B6B' },
            { label: 'Buffer Assist', color: '#F59E0B' },
            { label: 'Optimised',    color: '#00C9A7' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#4A5568] text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards list placeholder */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-[#8B9CB6] text-sm font-medium mb-3">Your Cards</p>
        <p className="text-[#4A5568] text-sm">Connect cards via Plaid to see balances & APRs</p>
      </div>

      {/* Transfer CTA */}
      <button
        type="button"
        disabled
        className="w-full bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 opacity-40 cursor-not-allowed"
      >
        Make a Payment
      </button>
    </div>
  );
}
