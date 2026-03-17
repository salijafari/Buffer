import imgQR from "@/assets/IMG_1226.webp";

export function CreditScore() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-6 items-center">

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
