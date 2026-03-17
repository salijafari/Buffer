import imgPhone from "@/assets/HeroSectionImage2.png";
import imgAppleIcon from "@/assets/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-0">
      <div className="container mx-auto max-w-7xl px-5">
        {/* Desktop: two-column grid. Mobile: single column with phone first */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">

          {/* MOBILE-ONLY: Phone visual (shown before headline on mobile) */}
          <div className="block md:hidden relative w-full mt-4 mb-6">
            <div
              className="relative mx-auto overflow-hidden rounded-[28px]"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                maxWidth: "100%",
                paddingTop: "16px",
              }}
            >
              <img
                src={imgPhone}
                alt="Buffer App"
                className="block mx-auto"
                style={{
                  width: "75%",
                  maxWidth: "320px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* LEFT on desktop / below phone on mobile: heading + description + buttons */}
          <div className="space-y-5 md:space-y-7 pt-2 md:pt-10 pb-8 md:pb-20">
            {/* QR Code — hidden on mobile */}
            <svg className="hidden md:block" width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="117" height="117" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
              <rect x="10" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="20" width="10" height="10" rx="1" fill="#111827"/>
              <rect x="77" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="83" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="87" y="20" width="10" height="10" rx="1" fill="#111827"/>
              <rect x="10" y="77" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="83" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="87" width="10" height="10" rx="1" fill="#111827"/>
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

            <h1 className="text-[40px] md:text-[44px] lg:text-[52px] font-bold leading-[0.95] tracking-[-0.03em]">
              Debt That Pays<br />Itself Down
            </h1>

            <p className="text-[16px] md:text-[18px] text-black leading-[1.55] md:leading-[30px] max-w-[445px]">
              Automatically reduce the interest on your cards and loans, accelerate your payoff timeline, strengthen your credit profile, and free up more of your paycheque every month.
            </p>

            <div className="flex flex-col gap-3 w-full md:w-auto md:items-start">
              <button className="flex items-center justify-center gap-3 bg-[#081419] text-white w-full md:w-auto px-6 py-3.5 md:py-3 rounded-[14px] md:rounded-[8px] hover:bg-gray-800 transition text-[16px] md:text-[17px]">
                <img src={imgAppleIcon} alt="Apple" className="w-5 h-auto" />
                <span>App Store</span>
              </button>
              <button className="bg-[#081419] text-white w-full md:w-auto px-6 py-3.5 md:py-3 rounded-[14px] md:rounded-[8px] hover:bg-gray-800 transition text-[16px] md:text-[17px]">
                Android
              </button>
              <button className="border border-black text-black w-full md:w-auto px-6 py-3.5 md:py-3 rounded-[14px] md:rounded-[8px] hover:bg-gray-50 transition text-[16px] md:text-[17px]">
                Web Sign-up / Login
              </button>
            </div>
          </div>

          {/* RIGHT: Phone — desktop only */}
          <div className="hidden md:block relative" style={{ minHeight: "540px" }}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-3xl"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                height: "400px",
              }}
            />
            <img
              src={imgPhone}
              alt="Buffer App"
              style={{
                position: "absolute",
                bottom: "0",
                right: "-40px",
                height: "520px",
                width: "auto",
                maxWidth: "none",
                zIndex: 10,
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
