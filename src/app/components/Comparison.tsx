import imgLogo from "@/assets/bf9e3122f64b138d3f91401bf73db550ddb81a1d.png";

const items = [
  { icon: "🏦", title: "Personal loan" },
  { icon: "💳", title: "Balance transfer card" },
  { icon: "📱", title: "Other credit apps" },
  { icon: "🔧", title: "Other apps" },
];

export function Comparison() {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="rounded-3xl px-8 py-14 text-white"
          style={{ background: "linear-gradient(-40.2deg, rgb(18,175,227) 0%, rgb(55,184,132) 90%)" }}
        >
          {/* Two overlapping circular logos */}
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden z-10">
                <img src={imgLogo} alt="Buffer" className="w-12 h-12 object-contain" />
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center -ml-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
            How is Buffer different?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-4 rounded-xl cursor-pointer transition"
                style={{ backgroundColor: "rgba(67,133,146,0.85)" }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="flex-1 text-[18px] font-bold text-white">{item.title}</span>
                <svg className="w-4 h-4 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
