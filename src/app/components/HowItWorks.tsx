export function HowItWorks() {
  return (
    <section className="py-16 bg-white">
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
                Complete a quick application and get instantly approved for a Gauss credit line.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#12afe3]">
                2
              </div>
              <h3 className="text-2xl font-bold">Transfer your balance</h3>
              <p className="text-white/90 leading-relaxed">
                Move your high-interest credit card debt to Gauss at a much lower rate.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#12afe3]">
                3
              </div>
              <h3 className="text-2xl font-bold">Save and pay off faster</h3>
              <p className="text-white/90 leading-relaxed">
                Watch your credit score improve while paying thousands less in interest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
