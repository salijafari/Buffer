import imgPhone from "@/assets/HeroSectionImage2.png";
import imgAppleIcon from "@/assets/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";
import imgQR from "@/assets/IMG_1226.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-0">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT: QR + heading + description + buttons */}
          <div className="space-y-7 pt-8 md:pt-10 pb-14 md:pb-20">
            {/* QR Code */}
            <img src={imgQR} alt="Scan to download Buffer" width="117" height="117" style={{ borderRadius: "8px" }} />

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

          {/* RIGHT: Phone overflowing above soft blue gradient background */}
          <div className="hidden md:block relative" style={{ minHeight: "540px" }}>
            {/* Blue box: fixed height, anchored to bottom */}
            <div
              className="absolute inset-x-0 bottom-0 rounded-3xl"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                height: "400px",
              }}
            />
            {/* Phone: taller than box, both bottom-aligned → top extends above box */}
            <img
              src={imgPhone}
              alt="Buffer App"
              style={{
                position: "absolute",
                bottom: "0",
                right: "-40px",
                height: "520px",
                width: "auto",
                zIndex: 10,
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
