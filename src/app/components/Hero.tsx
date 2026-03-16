import imgPhone from "@/assets/HeroSectionImage2.png";
import imgAppleIcon from "@/assets/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-14 md:pt-20 pb-0">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT: QR + heading + description + buttons */}
          <div className="space-y-7 pb-14 md:pb-20">
            {/* QR Code */}
            <svg width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            <h1 className="text-5xl md:text-[44px] lg:text-[52px] font-bold leading-[1.15] tracking-[-1.5px]">
              Debt That Pays<br />Itself Down
            </h1>

            <p className="text-[18px] text-black leading-[30px] max-w-[445px]">
              Automatically reduce the interest on your cards and loans, accelerate your payoff timeline, strengthen your credit profile, and free up more of your paycheque every month.
            </p>

            <div className="flex flex-col gap-3 items-start">
              <button className="flex items-center gap-3 bg-[#081419] text-white px-6 py-3 rounded-[8px] hover:bg-gray-800 transition">
                <img src={imgAppleIcon} alt="Apple" className="w-5 h-auto" />
                <span className="text-[17px]">App Store</span>
              </button>
              <button className="bg-[#081419] text-white px-6 py-3 rounded-[8px] hover:bg-gray-800 transition text-[17px]">
                Android
              </button>
              <button className="border border-black text-black px-6 py-3 rounded-[8px] hover:bg-gray-50 transition text-[17px]">
                Web Sign-up / Login
              </button>
            </div>
          </div>

          {/* RIGHT: Phone on soft blue gradient background */}
          <div className="hidden md:flex justify-center items-end">
            <div
              className="relative rounded-3xl overflow-hidden flex items-end justify-center"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                width: "550px",
                height: "399px",
              }}
            >
              <img
                src={imgPhone}
                alt="Buffer App"
                style={{ height: "450px", width: "498px", objectFit: "contain", marginBottom: "-51px" }}
                className="relative z-10"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
