import imgPhone from "@/assets/78418ac86a25c5da27de25e83deb68698e0d42f2.png";

const steps = [
  {
    n: "1",
    text: "Apply in minutes and get an instant decision on your Buffer credit line.",
  },
  {
    n: "2",
    text: "Connect your cards and accounts via Buffer.",
  },
  {
    n: "3",
    text: "Transfer high-interest balances. Buffer AI finds ways to lower interest and improve credit terms across cards and loans.",
  },
  {
    n: "4",
    text: "Keep using your accounts while the cost of credit keeps going down.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 overflow-hidden rounded-3xl" style={{ minHeight: "480px" }}>

          {/* LEFT: Dark panel — How it works steps */}
          <div className="bg-[#0f1923] text-white px-10 py-12 md:px-14 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-10">How it works</h2>
            <ol className="space-y-7">
              {steps.map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  >
                    {s.n}
                  </span>
                  <p className="text-[15px] leading-[22px] text-white/80">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* RIGHT: Light panel — phone image */}
          <div
            className="flex items-end justify-center"
            style={{ backgroundColor: "#e8f2f8" }}
          >
            <img
              src={imgPhone}
              alt="How Buffer works"
              className="max-h-[440px] w-auto object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
