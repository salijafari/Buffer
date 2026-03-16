export function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#1597c4] to-[#137eb3] rounded-3xl p-12 text-white flex flex-col justify-center min-h-[400px]">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Better Credit.<br />
              Lower Bills.<br />
              Faster Payoff²
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-[#c8e0f3] to-[#d3ebe7] rounded-3xl p-12 flex flex-col justify-center min-h-[400px]">
            <div className="space-y-6">
              <div className="bg-white/20 rounded-2xl p-8">
                <svg className="w-full h-48" viewBox="0 0 300 200" fill="none">
                  <rect x="40" y="140" width="40" height="40" fill="#1597c4" rx="4" />
                  <rect x="90" y="110" width="40" height="70" fill="#1597c4" rx="4" />
                  <rect x="140" y="80" width="40" height="90" fill="#1597c4" rx="4" />
                  <rect x="190" y="50" width="40" height="120" fill="#1597c4" rx="4" />
                  <rect x="240" y="20" width="40" height="150" fill="#1597c4" rx="4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#1597c4]">
                Improve Credit Score
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Watch your credit score grow as Gauss automatically optimizes your credit utilization and payment history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
