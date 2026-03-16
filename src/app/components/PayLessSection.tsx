const banks = [
  { name: "RBC",  initials: "RBC",  color: "#E31837", originalApr: "20%", newApr: "14%" },
  { name: "TD",   initials: "TD",   color: "#34A853", originalApr: "22%", newApr: "14%" },
  { name: "CIBC", initials: "CIBC", color: "#C41F3E", originalApr: "19%", newApr: "14%" },
];

export function PayLessSection() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-6 items-center">

          {/* LEFT: Card UI mockup */}
          <div
            className="rounded-3xl p-8 flex flex-col justify-between"
            style={{ backgroundColor: "#eef6fb", minHeight: "420px" }}
          >
            {/* Bank rows */}
            <div className="space-y-3">
              {banks.map((bank) => (
                <div
                  key={bank.name}
                  className="flex items-center gap-3 bg-white px-4 py-3"
                  style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}
                >
                  {/* Colored circle with initials */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold"
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: bank.color,
                      fontSize: "9px",
                    }}
                  >
                    {bank.initials}
                  </div>

                  {/* Bank name */}
                  <span className="text-sm font-medium text-gray-800 flex-1 min-w-0">
                    {bank.name}
                  </span>

                  {/* Strikethrough original APR */}
                  <span className="text-sm text-gray-400 line-through whitespace-nowrap">
                    APR {bank.originalApr}
                  </span>

                  {/* Arrow */}
                  <span className="text-gray-400 mx-1">→</span>

                  {/* New APR */}
                  <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    APR {bank.newApr}
                  </span>
                </div>
              ))}
            </div>

            {/* Credit card shape */}
            <div className="mt-6 flex flex-col gap-2">
              <div
                className="rounded-2xl flex flex-col justify-between p-3"
                style={{ width: "120px", height: "75px", backgroundColor: "#d1d5db" }}
              >
                <div
                  className="rounded-sm"
                  style={{ width: "28px", height: "18px", backgroundColor: "#9ca3af" }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "0.08em" }}>
                1234 5678 9000 0000
              </span>
            </div>
          </div>

          {/* RIGHT: Copy */}
          <div className="space-y-5">
            {/* Icon chip — matches CreditScore / LateProtection pattern */}
            <div className="inline-flex items-center justify-center bg-black text-white w-10 h-10 rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Spend less on interest. Finish sooner.
            </h2>

            <p className="text-[18px] text-gray-800 leading-[28px]">
              Buffer finds you a lower-rate credit line and uses it to automatically pay down
              your highest-interest balances. No paperwork, no branch visits, no negotiating
              with your bank.
            </p>

            <p className="text-[18px] text-gray-800 leading-[28px]">
              Your card balances move to a lower APR.<sup>1</sup> You save on interest charges
              and reach debt-free faster.<sup>2</sup>
            </p>

            <p className="text-[18px] text-gray-800 leading-[28px]">
              Keep using your existing cards while Buffer continuously works in the background
              to reduce what your debt costs you.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
