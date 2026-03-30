import { useState, useEffect, useLayoutEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSeoMeta } from "@/lib/useSeoMeta";
import imgBufferIcon from "@/assets/buffer-icon.png";
import imgAppStore from "@/assets/57f4b0a1f2ee89dd31423d5adc1d2df67c6bdb14.png";

const socialIcons = [
  <svg key="ig" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  <svg key="tw" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>,
  <svg key="li" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  <svg key="yt" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  <svg key="fb" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>,
];

interface CalcResult {
  monthlyPayment: number;
  months: number;
  totalInterest: number;
  totalPaid: number;
  startingMin?: number;
  error?: string;
}

function calcFromPayment(balance: number, apr: number, monthlyPayment: number): CalcResult {
  if (balance <= 0) {
    return { monthlyPayment, months: 0, totalInterest: 0, totalPaid: 0, error: "Enter a balance." };
  }
  const r = apr / 100 / 12;
  const monthlyInterest = balance * r;
  if (monthlyPayment <= monthlyInterest) {
    return {
      monthlyPayment,
      months: Infinity,
      totalInterest: Infinity,
      totalPaid: Infinity,
      error: "Your payment doesn't cover the interest. Increase it to make progress.",
    };
  }
  if (r === 0) {
    const months = Math.ceil(balance / monthlyPayment);
    const totalPaid = monthlyPayment * months;
    return { monthlyPayment, months, totalInterest: 0, totalPaid };
  }
  const n = -Math.log(1 - (balance * r) / monthlyPayment) / Math.log(1 + r);
  const months = Math.ceil(n);
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - balance;
  return { monthlyPayment, months, totalInterest, totalPaid };
}

function calcFromMonths(balance: number, apr: number, targetMonths: number): CalcResult {
  if (balance <= 0) {
    return { monthlyPayment: 0, months: 0, totalInterest: 0, totalPaid: 0, error: "Enter a balance." };
  }
  const months = Math.max(1, targetMonths);
  const r = apr / 100 / 12;
  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = balance / months;
  } else {
    monthlyPayment = (balance * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - balance;
  return { monthlyPayment, months, totalInterest, totalPaid };
}

function calcMinPayment(balance: number, apr: number): CalcResult {
  if (balance <= 0) {
    return { monthlyPayment: 0, months: 0, totalInterest: 0, totalPaid: 0, error: "Enter a balance." };
  }
  const r = apr / 100 / 12;
  const maxMonths = 1200;
  let remainingBalance = balance;
  let totalPaid = 0;
  let months = 0;
  let startingMin = 0;

  while (remainingBalance > 0 && months < maxMonths) {
    const monthlyInterest = remainingBalance * r;
    const minPayment = Math.max(Math.floor(remainingBalance * 0.02 + monthlyInterest), 10);

    if (months === 0) startingMin = minPayment;

    if (minPayment >= remainingBalance + monthlyInterest) {
      totalPaid += remainingBalance + monthlyInterest;
      months += 1;
      remainingBalance = 0;
      break;
    }

    totalPaid += minPayment;
    remainingBalance = remainingBalance + monthlyInterest - minPayment;
    months += 1;
  }

  const totalInterest = totalPaid - balance;
  return { monthlyPayment: startingMin, months, totalInterest, totalPaid, startingMin };
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const educationalSections = [
  {
    title: "How to Use the Buffer Payoff Calculator",
    body: "Enter your current credit card balance, the annual interest rate (APR) on your card, and either the monthly payment you can afford or the number of months you'd like to be debt-free. Then hit Calculate. The results show your estimated payoff timeline, total interest paid, and total amount paid.",
  },
  {
    title: "Balance owed",
    body: "This is the current outstanding balance on your credit card. Include all balances you plan to pay off. The higher the balance, the more interest you'll pay over time — which is why transferring to a lower-rate product like Buffer can save you thousands.",
  },
  {
    title: "Interest rate (APR)",
    body: "The Annual Percentage Rate is the yearly cost of borrowing. Most Canadian credit cards charge between 19.99% and 29.99% APR. Buffer's credit line starts as low as 14%, which can dramatically reduce how much interest you pay over time.",
  },
  {
    title: "Monthly payment",
    body: "The amount you pay each month toward your balance. Paying more than the minimum each month reduces your principal faster and dramatically cuts total interest. Even a small increase in monthly payment can shave months — or years — off your payoff timeline.",
  },
  {
    title: "Months to pay off",
    body: "If you have a specific payoff goal in mind — like being debt-free in 24 months — enter that number and the calculator will tell you the exact monthly payment required. This is useful for budgeting toward a clear financial target.",
  },
  {
    title: "Snowball vs. Avalanche methods",
    body: "The debt snowball method pays off the smallest balance first for psychological wins. The avalanche method targets the highest interest rate first to minimize total interest paid. Buffer simplifies this by consolidating your balances into one lower-rate line, so you only make one payment and always target the most expensive debt automatically.",
  },
  {
    title: "Paying off a large amount of credit card debt",
    body: "Large balances can feel overwhelming, but a structured plan makes them manageable. With a lower interest rate, more of each payment goes toward principal. Buffer users typically reduce their effective interest rate by 30–60%, which can cut years off their payoff timeline and save thousands in interest.",
  },
  {
    title: "The impact of paying off credit cards on your credit score",
    body: "Paying down credit card debt lowers your credit utilization ratio — one of the biggest factors in your credit score. Buffer users on average see their credit score improve within the first few months. Consistent on-time payments and lower utilization can add dozens of points over time.",
  },
  {
    title: "How is credit card interest calculated?",
    body: "Credit card interest is calculated daily on your outstanding balance using your daily periodic rate (APR ÷ 365). If you carry a balance from month to month, interest compounds — meaning you pay interest on interest. This is why even a small reduction in APR can have a large impact over time.",
  },
  {
    title: "How is the monthly payment calculated?",
    body: "The required monthly payment to pay off a balance in a set number of months is calculated using the standard amortization formula: PMT = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the principal, r is the monthly interest rate, and n is the number of months. Buffer uses this formula to give you accurate, personalized estimates.",
  },
];

const calculatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Buffer Credit Card Payoff Calculator",
  "url": "https://mybuffer.ca/payoff-calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Free calculator that shows how long it will take to pay off your credit card debt, how much interest you will pay, and how much you can save with Buffer's lower interest rate.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CAD"
  },
  "provider": {
    "@type": "Organization",
    "name": "Buffer",
    "url": "https://mybuffer.ca/"
  }
};

export default function PayoffCalculator() {
  useSeoMeta({
    title: "Credit Card Payoff Calculator – Buffer | Canada",
    description: "Free credit card payoff calculator. Enter your balance, APR, and monthly payment to see your debt-free date, total interest, and how much you save with Buffer.",
    canonical: "https://mybuffer.ca/payoff-calculator",
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Inject page-specific JSON-LD
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "payoff-calculator-jsonld";
    script.textContent = JSON.stringify(calculatorJsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById("payoff-calculator-jsonld")?.remove(); };
  }, []);

  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("24");
  const [mode, setMode] = useState<"payment" | "months">("payment");
  const [payment, setPayment] = useState("200");
  const [months, setMonths] = useState("36");
  const [showMinPayment, setShowMinPayment] = useState(false);
  const [result, setResult] = useState<CalcResult>(() => calcFromPayment(5000, 24, 200));

  function handleCalculate() {
    const b = parseFloat(balance.replace(/,/g, "")) || 0;
    const a = parseFloat(apr) || 0;

    if (showMinPayment) {
      setResult(calcMinPayment(b, a));
      return;
    }

    if (mode === "payment") {
      const p = parseFloat(payment.replace(/,/g, "")) || 0;
      setResult(calcFromPayment(b, a, p));
    } else {
      const m = parseInt(months) || 0;
      setResult(calcFromMonths(b, a, m));
    }
  }

  const isError = !!result.error;
  const b = parseFloat(balance.replace(/,/g, "")) || 0;
  const a = parseFloat(apr) || 0;

  // Buffer comparison (only in min payment mode, no error)
  const bufferResult =
    showMinPayment && result.startingMin && !isError
      ? calcFromPayment(b, 14, result.startingMin)
      : null;

  const balancePct = isError ? 50 : Math.round((b / result.totalPaid) * 100);
  const interestPct = isError ? 50 : 100 - balancePct;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Title */}
        <section className="pt-14 pb-8 bg-white text-center">
          <div className="container mx-auto max-w-4xl px-5">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Credit Card Payoff Calculator
            </h1>
            <p className="text-[18px] text-gray-600 max-w-2xl mx-auto">
              See how long it will take to pay off your credit card debt — and how much interest you'll pay along the way.
            </p>
          </div>
        </section>

        {/* Calculator card */}
        <section className="py-6 bg-white">
          <div className="container mx-auto max-w-5xl px-5">
            <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden grid md:grid-cols-2">
              {/* LEFT: Inputs */}
              <div className="bg-white px-8 py-10">
                <h2 className="text-xl font-bold mb-7">Your Details</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Credit Card Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-[#12AFE3]/40 focus:border-[#12AFE3]"
                        placeholder="5000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Interest Rate (APR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={apr}
                        onChange={(e) => setApr(e.target.value)}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-[#12AFE3]/40 focus:border-[#12AFE3]"
                        placeholder="24"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                    </div>
                  </div>

                  {/* Mode toggle row */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => { setMode("payment"); setShowMinPayment(false); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                          mode === "payment" && !showMinPayment
                            ? "bg-[#0f1923] text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Monthly Payment
                      </button>
                      <button
                        onClick={() => { setMode("months"); setShowMinPayment(false); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                          mode === "months" && !showMinPayment
                            ? "bg-[#0f1923] text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Months to Pay Off
                      </button>
                    </div>

                    {/* Min payment toggle */}
                    <label className="flex items-center gap-2.5 mb-3 cursor-pointer select-none">
                      <div
                        onClick={() => setShowMinPayment((v) => !v)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${showMinPayment ? "bg-[#12AFE3]" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showMinPayment ? "translate-x-4" : ""}`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Show minimum payment only</span>
                    </label>

                    {/* Dynamic input field */}
                    {mode === "payment" ? (
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${showMinPayment ? "text-gray-300" : "text-gray-500"}`}>$</span>
                        <input
                          type="number"
                          value={payment}
                          onChange={(e) => setPayment(e.target.value)}
                          disabled={showMinPayment}
                          className={`w-full pl-8 pr-4 py-3 rounded-xl border text-[16px] font-medium focus:outline-none transition ${
                            showMinPayment
                              ? "border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#12AFE3]/40 focus:border-[#12AFE3]"
                          }`}
                          placeholder="200"
                          min="0"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={months}
                          onChange={(e) => setMonths(e.target.value)}
                          disabled={showMinPayment}
                          className={`w-full pl-4 pr-16 py-3 rounded-xl border text-[16px] font-medium focus:outline-none transition ${
                            showMinPayment
                              ? "border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#12AFE3]/40 focus:border-[#12AFE3]"
                          }`}
                          placeholder="36"
                          min="1"
                        />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${showMinPayment ? "text-gray-300" : "text-gray-500"}`}>months</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCalculate}
                    className="w-full py-3.5 bg-[#0f1923] text-white rounded-xl font-semibold text-[16px] hover:bg-[#1a2d3d] transition mt-2"
                  >
                    Calculate
                  </button>
                </div>
              </div>

              {/* RIGHT: Results */}
              <div
                className="px-8 py-10"
                style={{ background: "linear-gradient(135deg, rgb(226,239,245) 0%, rgb(219,233,255) 100%)" }}
              >
                <h2 className="text-xl font-bold mb-7">Results</h2>

                {isError ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-red-500 text-center text-sm font-medium">
                      {result.error}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 4 metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Monthly Payment</p>
                        {showMinPayment && result.startingMin ? (
                          <>
                            <p className="text-2xl font-bold text-[#0f1923]">${fmt(result.startingMin, 0)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">starting</p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-[#0f1923]">${fmt(result.monthlyPayment, 0)}</p>
                        )}
                      </div>
                      <div className="bg-white rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Months to Debt-Free</p>
                        <p className="text-2xl font-bold text-[#0f1923]">{fmt(result.months)}</p>
                      </div>
                      <div className="bg-white rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total Interest</p>
                        <p className="text-2xl font-bold text-[#12AFE3]">${fmt(result.totalInterest, 0)}</p>
                      </div>
                      <div className="bg-white rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-[#0f1923]">${fmt(result.totalPaid, 0)}</p>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div>
                      <div className="flex rounded-full overflow-hidden h-4 mb-2">
                        <div
                          className="h-full"
                          style={{ width: `${balancePct}%`, backgroundColor: "#0f1923" }}
                        />
                        <div
                          className="h-full"
                          style={{ width: `${interestPct}%`, background: "linear-gradient(90deg, #12AFE3, #37B884)" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0f1923] inline-block" />
                          Principal ({balancePct}%)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#12AFE3] inline-block" />
                          Interest ({interestPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Comparison row — only in min payment mode */}
                    {showMinPayment && bufferResult && !bufferResult.error && (
                      <div className="mt-6 rounded-2xl bg-white/70 border border-white px-5 py-4 space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 w-2.5 h-2.5 rounded-full bg-[#12AFE3] flex-shrink-0 mt-1" />
                          <p className="text-gray-600">
                            <span className="font-semibold text-gray-800">At minimum payments:</span>{" "}
                            debt-free in {fmt(result.months)} months,{" "}
                            <span className="text-[#12AFE3] font-semibold">${fmt(result.totalInterest, 0)} in interest</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 w-2.5 h-2.5 rounded-full bg-[#37B884] flex-shrink-0 mt-1" />
                          <p className="text-gray-600">
                            <span className="font-semibold text-gray-800">With Buffer (14% APR, same ${fmt(result.startingMin ?? 0)}/mo):</span>{" "}
                            debt-free in {fmt(bufferResult.months)} months,{" "}
                            <span className="text-[#37B884] font-semibold">${fmt(bufferResult.totalInterest, 0)} in interest</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Educational content */}
        <section className="py-12 bg-white">
          <div className="container mx-auto max-w-3xl px-5">
            <div className="space-y-10">
              {educationalSections.map((s) => (
                <div key={s.title}>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-[16px] text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Now */}
        <section className="py-6 bg-white">
          <div className="container mx-auto max-w-7xl px-5">
            <div
              className="rounded-3xl py-16 px-8 text-center"
              style={{ background: "linear-gradient(135deg, rgb(226,239,245) 0%, rgb(219,233,255) 100%)" }}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              <h2 className="text-4xl font-bold mb-3 tracking-tight">Join Now</h2>
              <p className="text-[18px] text-gray-700 mb-8">
                Scan the QR code to create your account.
              </p>

              <div className="flex flex-col items-center gap-4">
                <img src={imgBufferIcon} alt="Buffer" className="w-[140px] h-[140px]" style={{ borderRadius: "28px" }} />
                <img src={imgAppStore} alt="Download on App Store" className="h-[13px] w-auto" />
              </div>

              {/* Social icons */}
              <div className="flex justify-center gap-3 mt-8">
                {socialIcons.map((icon) => (
                  <button
                    key={(icon as React.ReactElement).key}
                    className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-6">Now available in Canada.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
