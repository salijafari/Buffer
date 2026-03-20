import imgPhone from "@/assets/Nolatefee.png";

export function LateProtection() {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="flex flex-col md:grid overflow-hidden"
          style={{
            gridTemplateColumns: "45fr 55fr",
            alignItems: "center",
            background: "linear-gradient(135deg, #eef5f3 0%, #f3f5fb 100%)",
            borderRadius: "32px",
          }}
        >
          {/* LEFT: phone visual */}
          <div
            style={{
              position: "relative",
              minHeight: "280px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflow: "hidden",
            }}
            className="min-h-[280px] md:min-h-[520px]"
          >
            <img
              src={imgPhone}
              alt="Late payment protection app screen"
              style={{
                position: "relative",
                top: "-8px",
                maxHeight: "500px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* RIGHT: text content */}
          <div className="px-6 py-8 md:py-14 md:pl-8 md:pr-16" style={{ maxWidth: "620px" }}>
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                lineHeight: 0.95,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "24px",
                color: "#0a0a0a",
              }}
            >
              Late Payment Shield
            </h2>
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 24px)",
                lineHeight: 1.5,
                marginBottom: "28px",
                color: "#374151",
              }}
            >
              Stop losing money to late fees. Buffer tracks every payment deadline across your accounts and notifies you before anything comes due.
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "20px", listStyle: "none", margin: 0, padding: 0 }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#1ba19c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span style={{ fontSize: "18px", color: "#374151", lineHeight: 1.5 }}>Automatic payment reminders</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#1ba19c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span style={{ fontSize: "18px", color: "#374151", lineHeight: 1.5 }}>Intelligent scheduling to stay ahead of due dates</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#1ba19c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span style={{ fontSize: "18px", color: "#374151", lineHeight: 1.5 }}>Protection against penalty rate hikes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
