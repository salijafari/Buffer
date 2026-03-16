import imgGauss from "@/assets/bf9e3122f64b138d3f91401bf73db550ddb81a1d.png";

export function Comparison() {
  const comparisons = [
    {
      icon: imgGauss,
      title: "Personal loan",
      arrow: true
    },
    {
      icon: imgGauss,
      title: "Balance transfer card",
      arrow: true
    },
    {
      icon: imgGauss,
      title: "Other credit apps",
      arrow: true
    },
    {
      icon: imgGauss,
      title: "Other apps",
      arrow: false
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="bg-gradient-to-br from-[#12afe3] to-[#37b884] rounded-3xl p-8 md:p-16">
          <div className="text-center mb-12">
            <img src={imgGauss} alt="Buffer" className="w-[225px] h-auto mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              How is Buffer different?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisons.map((item, index) => (
              <div
                key={index}
                className="bg-[#438592] hover:bg-[#4a929f] transition rounded-xl p-6 flex items-center gap-4 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-white">{item.title}</p>
                </div>
                {item.arrow && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="bg-[#00659e] hover:bg-[#00547f] transition text-white px-8 py-4 rounded-xl text-xl font-bold">
              See the full comparison →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
