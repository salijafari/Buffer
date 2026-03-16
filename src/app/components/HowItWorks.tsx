export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="bg-gradient-to-br from-[#12afe3] to-[#37b884] rounded-3xl p-8 md:p-16 text-white">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#12afe3]">
                1
              </div>
              <h3 className="text-2xl font-bold">Apply in minutes</h3>
              <p className="text-white/90 leading-relaxed">
                Fill out a short application and get an instant decision on your Buffer credit line.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#12afe3]">
                2
              </div>
              <h3 className="text-2xl font-bold">Move your high-rate debt</h3>
              <p className="text-white/90 leading-relaxed">
                Transfer your high-interest card balances to Buffer and start saving on day one.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#12afe3]">
                3
              </div>
              <h3 className="text-2xl font-bold">Watch your progress compound</h3>
              <p className="text-white/90 leading-relaxed">
                Your credit score strengthens while you pay a fraction of what the banks were charging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
