import imgPhone from "@/assets/e1c5d242b328eb754ecaa2b62f529e67177aed6f.png";
import imgAppleIcon from "@/assets/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 md:pt-20 pb-0">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-8 pb-16 md:pb-20">
            {/* QR Code Placeholder */}
            <svg width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Border */}
              <rect width="117" height="117" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
              {/* Top-left position square */}
              <rect x="10" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="20" width="10" height="10" rx="1" fill="#111827"/>
              {/* Top-right position square */}
              <rect x="77" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="83" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="87" y="20" width="10" height="10" rx="1" fill="#111827"/>
              {/* Bottom-left position square */}
              <rect x="10" y="77" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="83" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="87" width="10" height="10" rx="1" fill="#111827"/>
              {/* Data modules - middle area */}
              <rect x="48" y="10" width="6" height="6" fill="#111827"/>
              <rect x="57" y="10" width="6" height="6" fill="#111827"/>
              <rect x="48" y="20" width="6" height="6" fill="#111827"/>
              <rect x="57" y="20" width="6" height="6" fill="#111827"/>
              <rect x="48" y="30" width="6" height="6" fill="#111827"/>
              <rect x="10" y="48" width="6" height="6" fill="#111827"/>
              <rect x="20" y="48" width="6" height="6" fill="#111827"/>
              <rect x="30" y="48" width="6" height="6" fill="#111827"/>
              <rect x="48" y="48" width="6" height="6" fill="#111827"/>
              <rect x="57" y="48" width="6" height="6" fill="#111827"/>
              <rect x="66" y="48" width="6" height="6" fill="#111827"/>
              <rect x="77" y="48" width="6" height="6" fill="#111827"/>
              <rect x="87" y="48" width="6" height="6" fill="#111827"/>
              <rect x="101" y="48" width="6" height="6" fill="#111827"/>
              <rect x="48" y="57" width="6" height="6" fill="#111827"/>
              <rect x="66" y="57" width="6" height="6" fill="#111827"/>
              <rect x="87" y="57" width="6" height="6" fill="#111827"/>
              <rect x="101" y="57" width="6" height="6" fill="#111827"/>
              <rect x="57" y="66" width="6" height="6" fill="#111827"/>
              <rect x="77" y="66" width="6" height="6" fill="#111827"/>
              <rect x="101" y="66" width="6" height="6" fill="#111827"/>
              <rect x="48" y="77" width="6" height="6" fill="#111827"/>
              <rect x="66" y="77" width="6" height="6" fill="#111827"/>
              <rect x="77" y="87" width="6" height="6" fill="#111827"/>
              <rect x="87" y="87" width="6" height="6" fill="#111827"/>
              <rect x="101" y="77" width="6" height="6" fill="#111827"/>
              <rect x="48" y="87" width="6" height="6" fill="#111827"/>
              <rect x="57" y="101" width="6" height="6" fill="#111827"/>
              <rect x="77" y="101" width="6" height="6" fill="#111827"/>
              <rect x="87" y="101" width="6" height="6" fill="#111827"/>
              <rect x="101" y="101" width="6" height="6" fill="#111827"/>
            </svg>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Debt That Pays<br />Itself Down
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed max-w-md">
              Automatically reduce the interest on your cards and loans, accelerate your payoff timeline, strengthen your credit profile, and free up more of your paycheque every month.
            </p>

            <div className="space-y-4">
              <button className="flex items-center gap-3 bg-[#081419] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                <img src={imgAppleIcon} alt="Apple" className="w-5 h-auto" />
                <span className="text-base">App Store</span>
              </button>

              <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
                Android
              </button>

              <button className="border border-black text-black px-8 py-3 rounded-lg hover:bg-gray-50 transition block w-full md:w-auto">
                Web Sign-up / Login
              </button>
            </div>
          </div>

          <div className="relative md:-mr-5 hidden md:block">
            <div className="relative rounded-l-3xl bg-gradient-to-br from-[#c8e0f3] to-[#d3ebe7] overflow-hidden h-[560px]">
              <img
                src={imgPhone}
                alt="Buffer App"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
