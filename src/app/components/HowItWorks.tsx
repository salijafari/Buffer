import imgPhone from "@/assets/IMG_1250.png";

const steps = [
  {
    n: "1",
    text: "Pull your credit data and see where your money is going",
  },
  {
    n: "2",
    text: "Connect your cards and accounts securely",
  },
  {
    n: "3",
    text: "Buffer moves your balance to lower interest automatically",
  },
  {
    n: "4",
    text: "Watch your debt shrink faster while you keep spending as usual",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-[32px]"
          style={{
            background: "linear-gradient(135deg, #0b72a8 0%, #4daee6 100%)",
            padding: "56px 64px",
            minHeight: "480px",
          }}
        >
          {/* LEFT: title + steps — ~55% */}
          <div
            className="flex flex-col justify-center"
            style={{ flex: "0 0 55%", paddingRight: "48px" }}
          >
            <h2
              className="text-white font-extrabold mb-10"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.1 }}
            >
              How it works
            </h2>
            <ol style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {steps.map((s) => (
                <li key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#0f1923",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {s.n}
                  </span>
                  <p
                    style={{
                      fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
                      lineHeight: 1.45,
                      color: "#ffffff",
                      margin: 0,
                      paddingTop: "6px",
                    }}
                  >
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* RIGHT: phone image — ~45% */}
          <div
            className="flex items-center justify-center mt-10 md:mt-0"
            style={{ flex: "0 0 45%" }}
          >
            <img
              src={imgPhone}
              alt="Buffer app screen"
              style={{
                maxWidth: "460px",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
