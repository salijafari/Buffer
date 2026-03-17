import imgQR from "@/assets/IMG_1226.webp";

export function CreditScore() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">

        {/* ── MOBILE: one unified card ── */}
        <div
          className="md:hidden"
          style={{
            borderRadius: "32px",
            background: "linear-gradient(19.5deg, rgb(225,240,242) 8%, rgb(248,247,247) 48%, rgb(232,240,252) 96%)",
            overflow: "hidden",
            padding: "0 0 28px",
          }}
        >
          {/* Phone visual */}
          <div style={{ position: "relative", minHeight: "360px" }}>
            <img
              src={imgQR}
              alt="Scan to download Buffer"
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                height: "92%",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Badge + headline + body — inside the same card */}
          <div style={{ padding: "28px 24px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                borderRadius: "9999px",
                background: "#000",
                color: "#fff",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: "20px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z"/>
              </svg>
              powered by AI
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight" style={{ marginBottom: "20px" }}>
              Your personal debt strategist
            </h2>
            <p className="text-[18px] text-gray-800 leading-[28px]">
              Tell Buffer your situation once. It maps out exactly how to cut your interest costs, tracks your credit across bureaus, surfaces better card and loan options you actually qualify for, builds a payoff plan around your real income and spending — and quietly handles the rest in the background.
            </p>
          </div>
        </div>

        {/* ── TABLET / DESKTOP: original two-column grid ── */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 items-center">

          {/* LEFT: phone mockup on gradient card — top-anchored */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "32px",
              background: "linear-gradient(19.5deg, rgb(225,240,242) 8%, rgb(248,247,247) 48%, rgb(232,240,252) 96%)",
              minHeight: "480px",
            }}
          >
            <img
              src={imgQR}
              alt="Scan to download Buffer"
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                height: "92%",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          {/* RIGHT: AI badge + heading + description */}
          <div className="space-y-5 px-4 md:px-8">
            {/* AI powered badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 22px",
                borderRadius: "9999px",
                background: "#000",
                color: "#fff",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: "28px",
              }}
            >
              {/* Sparkle / AI icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z"/>
              </svg>
              powered by AI
            </div>

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
