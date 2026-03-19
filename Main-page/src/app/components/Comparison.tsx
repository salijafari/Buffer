import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";

const MONTHLY_RATE = 0.2199 / 12;
const DEFAULT_BALANCE = 5000;

interface CalcResult {
  months: number;
  totalPaid: number;
  totalInterest: number;
  principalPct: number;
  interestPct: number;
  month1MinPayment: number;
  formatted: string;
}

function calcFirstMinPayment(balance: number): number {
  const interest = balance * MONTHLY_RATE;
  return Math.max(Math.floor(balance * 0.02 + interest), 10);
}

function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} years`;
  return `${years} yrs ${rem} mo`;
}

function formatDollar(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}

function calculate(balance: number): CalcResult {
  const month1MinPayment = calcFirstMinPayment(balance);
  let remaining = balance;
  let totalPaid = 0;
  let months = 0;

  while (remaining > 0 && months < 1200) {
    const interest = remaining * MONTHLY_RATE;
    const minPay = Math.max(Math.floor(remaining * 0.02 + interest), 10);
    if (minPay >= remaining + interest) {
      totalPaid += remaining + interest;
      months++;
      break;
    }
    totalPaid += minPay;
    remaining = remaining + interest - minPay;
    months++;
  }

  const totalInterest = totalPaid - balance;
  const principalPct = (balance / totalPaid) * 100;
  const interestPct = (totalInterest / totalPaid) * 100;

  return {
    months,
    totalPaid,
    totalInterest,
    principalPct,
    interestPct,
    month1MinPayment,
    formatted: formatDuration(months),
  };
}

export function Comparison() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [result, setResult] = useState<CalcResult>(() => calculate(DEFAULT_BALANCE));

  useEffect(() => {
    setResult(calculate(balance));
  }, []);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBalance(val);
    setResult(calculate(val));
  }, []);

  const sliderPct = ((balance - 500) / (30000 - 500)) * 100;

  return (
    <section className="py-6 bg-white">
      <style>{`
        .debt-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            white 0%,
            white ${sliderPct}%,
            rgba(255,255,255,0.35) ${sliderPct}%,
            rgba(255,255,255,0.35) 100%
          );
        }
        .debt-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a6b5a;
          cursor: pointer;
          box-shadow: 0 0 0 4px white, 0 2px 8px rgba(0,0,0,0.25);
          transition: box-shadow 150ms ease;
        }
        .debt-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a6b5a;
          cursor: pointer;
          box-shadow: 0 0 0 4px white, 0 2px 8px rgba(0,0,0,0.25);
          border: none;
        }
        .debt-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px white, 0 2px 10px rgba(0,0,0,0.3);
        }
        .bar-segment {
          transition: width 300ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .calc-stat-row { grid-template-columns: 1fr 1fr !important; }
          .calc-stat-row > :last-child { grid-column: 1 / -1; }
          .calc-bar { height: 40px !important; }
          .calc-cta { width: 100% !important; }
        }
      `}</style>

      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="rounded-3xl px-8 py-14 text-white"
          style={{ background: "linear-gradient(-40.2deg, rgb(18,175,227) 0%, rgb(55,184,132) 90%)" }}
        >
          {/* Small label */}
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: "10px" }}>
            See what your debt is really costing you
          </p>

          {/* Dynamic headline */}
          <h2
            style={{ fontWeight: 700, lineHeight: 1.2, marginBottom: "32px", fontSize: "clamp(20px, 4vw, 32px)" }}
          >
            At minimum payments, {formatDollar(balance)} in debt<br />
            takes <span style={{ whiteSpace: "nowrap" }}>{result.formatted}</span> to pay off.
          </h2>

          {/* Slider */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", opacity: 0.6 }}>How much do you owe?</span>
              <span style={{ fontSize: "24px", fontWeight: 700 }}>{formatDollar(balance)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={30000}
              step={500}
              value={balance}
              onChange={handleSlider}
              className="debt-slider"
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", opacity: 0.5 }}>$500</span>
              <span style={{ fontSize: "11px", opacity: 0.5 }}>$30,000</span>
            </div>
          </div>

          {/* Stat row */}
          <div
            className="calc-stat-row"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "28px" }}
          >
            {[
              { label: "Monthly Minimum", value: formatDollar(result.month1MinPayment) },
              { label: "Total You'll Pay", value: formatDollar(result.totalPaid) },
              { label: "Years to Pay Off", value: result.formatted },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, lineHeight: 1.3 }}>
                  {s.label}
                </span>
                <span style={{ fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 700, lineHeight: 1.1 }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Stacked bar */}
          <div style={{ marginBottom: "10px" }}>
            <div
              className="calc-bar"
              style={{ display: "flex", width: "100%", height: "48px", borderRadius: "10px", overflow: "hidden" }}
            >
              <div
                className="bar-segment"
                style={{ width: `${result.principalPct}%`, background: "white" }}
              >
                {result.principalPct > 25 && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a6b5a" }}>
                    {formatDollar(balance)}
                  </span>
                )}
              </div>
              <div
                className="bar-segment"
                style={{ width: `${result.interestPct}%`, background: "rgba(0,0,0,0.25)" }}
              >
                {result.interestPct > 20 && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>
                    {formatDollar(result.totalInterest)}
                  </span>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", opacity: 0.8, display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", background: "white", borderRadius: "2px", flexShrink: 0 }} />
                Principal&nbsp;{formatDollar(balance)}
              </span>
              <span style={{ fontSize: "12px", opacity: 0.8, display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", background: "rgba(255,255,255,0.35)", borderRadius: "2px", flexShrink: 0 }} />
                Interest&nbsp;{formatDollar(result.totalInterest)}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button
              onClick={() => navigate("/payoff-calculator")}
              className="calc-cta"
              style={{
                background: "white",
                color: "#1a8a72",
                border: "none",
                borderRadius: "100px",
                padding: "14px 32px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                transition: "transform 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              See your full payoff plan &rarr;
            </button>
            <p style={{ fontSize: "11px", opacity: 0.7, marginTop: "8px" }}>
              Opens the payoff calculator
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
