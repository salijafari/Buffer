export function Features() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT: Dark card with large heading */}
          <div
            className="rounded-3xl p-12 md:p-14 text-white flex flex-col justify-center"
            style={{ backgroundColor: "#0f1923", minHeight: "420px" }}
          >
            <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Stronger Credit.<br />
              Lower Interest.<br />
              Debt-Free Sooner.²
            </h2>
          </div>

          {/* RIGHT: Light card with credit score + AI badge */}
          <div
            className="rounded-3xl p-10 flex flex-col justify-between"
            style={{ backgroundColor: "#eef6fb", minHeight: "420px" }}
          >
            {/* Score + bar chart */}
            <div>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-5xl font-bold text-gray-400">680</span>
                <div className="flex-1 mx-2">
                  <svg viewBox="0 0 140 80" className="w-full h-[80px]">
                    {/* bars */}
                    <rect x="8"  y="58" width="16" height="18" rx="2" fill="#1597c4"/>
                    <rect x="30" y="44" width="16" height="32" rx="2" fill="#1597c4"/>
                    <rect x="52" y="32" width="16" height="44" rx="2" fill="#1597c4"/>
                    <rect x="74" y="18" width="16" height="58" rx="2" fill="#1597c4"/>
                    <rect x="96" y="6"  width="16" height="70" rx="2" fill="#1597c4"/>
                    {/* upward arrow line */}
                    <polyline points="16,64 38,50 60,38 82,24 104,12" stroke="#1597c4" strokeWidth="2" fill="none"/>
                    {/* arrowhead */}
                    <polygon points="110,8 98,6 104,16" fill="#1597c4"/>
                  </svg>
                </div>
                <span className="text-5xl font-bold text-gray-800">760</span>
              </div>

              <h3 className="text-3xl font-bold text-[#1597c4] mb-3">
                Build Your Credit Score
              </h3>
              <p className="text-gray-700 leading-relaxed">
                See your credit score climb as Buffer automatically manages your credit utilization and keeps your payment history spotless.
              </p>
            </div>

            {/* powered by AI badge */}
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2 13.8 9 20 10 13.8 12 12 19 10.2 12 4 10 10.2 9Z"/>
                </svg>
                powered by AI
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
