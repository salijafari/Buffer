import imgQR from "@/assets/IMG_1226.webp";

export function CreditScore() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-6 items-center">

          {/* LEFT: phone mockup on gradient card — PersonalManager composition */}
          <div
            className="rounded-3xl overflow-hidden flex items-end justify-center"
            style={{
              background: "linear-gradient(19.5deg, rgb(225,240,242) 8%, rgb(248,247,247) 48%, rgb(232,240,252) 96%)",
              minHeight: "480px",
            }}
          >
            <img
              src={imgQR}
              alt="Scan to download Buffer"
              style={{
                width: "60%",
                maxWidth: "280px",
                display: "block",
                objectFit: "contain",
                borderRadius: "16px",
                margin: "auto auto 40px",
              }}
            />
          </div>

          {/* RIGHT: icon chip + heading + description */}
          <div className="space-y-5 px-4 md:px-8">
            {/* Credit card icon chip */}
            <div className="inline-flex items-center justify-center bg-black text-white w-10 h-10 rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Spend less on interest. Finish sooner.
            </h2>
            <p className="text-[18px] text-gray-800 leading-[28px]">
              Buffer's lower rates mean you keep thousands that would have gone to your bank — and reach debt-free years ahead of schedule.
            </p>
            <p className="text-[18px] text-gray-800 leading-[28px]">
              Your cards and loans move to lower APRs.<sup>1</sup> You save money on interest charges and pay off balances faster.<sup>2</sup>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
