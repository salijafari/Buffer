import imgPhone from "@/assets/0f784c2fc0dce30be8a6e9bc1cecd721a09cac2b.png";

export function PersonalManager() {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-6 items-center">

          {/* LEFT: Phone on soft gradient card */}
          <div
            className="rounded-3xl overflow-hidden flex items-end justify-center"
            style={{
              background: "linear-gradient(19.5deg, rgb(225,240,242) 8%, rgb(248,247,247) 48%, rgb(232,240,252) 96%)",
              minHeight: "480px",
            }}
          >
            <img
              src={imgPhone}
              alt="Personal Manager"
              className="max-h-[440px] w-auto object-contain"
            />
          </div>

          {/* RIGHT: powered by AI + heading + description */}
          <div className="space-y-5 px-4 md:px-8">
            {/* powered by AI badge */}
            <span className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 13.8 9 20 10 13.8 12 12 19 10.2 12 4 10 10.2 9Z"/>
              </svg>
              powered by AI
            </span>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Your personal debt strategist
            </h2>
            <p className="text-[18px] text-gray-800 leading-[28px]">
              Tell Buffer your situation once. It maps out exactly how to cut your interest costs, tracks your credit across bureaus, surfaces better card and loan options you actually qualify for, builds a payoff plan around your real income and spending — and quietly handles the rest in the background.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
