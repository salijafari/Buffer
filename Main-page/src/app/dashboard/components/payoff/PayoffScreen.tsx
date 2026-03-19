import { useState, useCallback } from "react";
import { DebtFreeChart } from "../charts/DebtFreeChart";
import { FINANCE } from "../../lib/finance";
import type { TimelineOutput, CardData, SimulationResult } from "../../types/timeline";

const MOCK_TIMELINE: TimelineOutput = {
  future1: {
    monthsToZero: 87,
    totalInterest: 4820,
    totalPaid: 16320,
    balanceArray: Array.from({ length: 87 }, (_, i) => Math.max(0, 11500 - i * 132)),
    debtFreeDate: new Date(Date.now() + 87 * 30 * 86400000),
    monthlyPayment: 210,
  },
  future2: {
    monthsToZero: 52,
    totalInterest: 2640,
    totalPaid: 14140,
    balanceArray: Array.from({ length: 52 }, (_, i) => Math.max(0, 11500 - i * 221)),
    debtFreeDate: new Date(Date.now() + 52 * 30 * 86400000),
    monthlyPayment: 450,
  },
  future3: {
    monthsToZero: 22,
    totalInterest: 780,
    totalPaid: 12280,
    balanceArray: Array.from({ length: 22 }, (_, i) => Math.max(0, 11500 - i * 523)),
    debtFreeDate: new Date(Date.now() + 22 * 30 * 86400000),
    monthlyPayment: 700,
  },
  recommendedPayment: 700,
  interestSavings: 4040,
  yearsSaved: 5.4,
  insufficientIncome: false,
  aprFallbackApplied: false,
  limitedHistory: false,
};

const MOCK_CARDS: CardData[] = [
  { id: "1", name: "TD Cashback Visa", last4: "4242", balance: 6800, apr: 0.1999, limit: 10000, institution: "TD", color: "#00A651" },
  { id: "2", name: "Scotiabank Gold Amex", last4: "8891", balance: 3200, apr: 0.2114, limit: 5000, institution: "BNS", color: "#EC0926" },
  { id: "3", name: "CIBC Visa Dividend", last4: "3377", balance: 1500, apr: 0.1999, limit: 3000, institution: "CIBC", color: "#C31E2E" },
];

function fmtCurrency(n: number, d = 0): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function calcFuture3Only(balance: number, bufferAPR: number, payment: number): SimulationResult {
  const rate = bufferAPR / 12;
  const balanceArray: number[] = [];
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  while (bal > 0 && months < 1200) {
    const interest = bal * rate;
    const paid = Math.min(payment, bal + interest);
    bal = bal + interest - paid;
    totalInterest += interest;
    totalPaid += paid;
    months++;
    balanceArray.push(Math.max(0, bal));
    if (paid <= interest && bal > 0) break;
  }
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  return { monthsToZero: months, totalInterest, totalPaid, balanceArray, debtFreeDate, monthlyPayment: payment };
}

export function PayoffScreen() {
  const [timeline, setTimeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [adjustedPayment, setAdjustedPayment] = useState(MOCK_TIMELINE.recommendedPayment);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAmountErr, setTransferAmountErr] = useState("");

  const totalDebt = MOCK_CARDS.reduce((s, c) => s + c.balance, 0);
  const handlePaymentChange = useCallback((payment: number) => {
    setAdjustedPayment(payment);
    const newF3 = calcFuture3Only(totalDebt, FINANCE.BUFFER_APR_DEFAULT, payment);
    setTimeline((prev) => ({ ...prev, future3: newF3 }));
  }, [totalDebt]);

  function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!selectedCard) return;
    if (!transferAmount || Number.isNaN(amount) || amount <= 0) {
      setTransferAmountErr("Enter a valid amount");
      return;
    }
    if (amount > selectedCard.balance) {
      setTransferAmountErr(`Max ${fmtCurrency(selectedCard.balance, 2)}`);
      return;
    }
    setTransferAmountErr("");
    setTransferAmount("");
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      <div>
        <h1 className="text-[#0F172A] text-2xl font-bold">Payoff Planner</h1>
        <p className="text-[#475569] text-sm mt-1">Accelerate your path to debt freedom</p>
      </div>

      <section className="bg-white rounded-2xl p-5">
        <DebtFreeChart
          future1={timeline.future1}
          future2={timeline.future2}
          future3={timeline.future3}
          adjustedPayment={adjustedPayment}
          onPaymentChange={handlePaymentChange}
          sliderMin={210}
          sliderMax={1400}
          sliderStep={10}
          sliderDefault={timeline.recommendedPayment}
        />
      </section>

      <section className="bg-white rounded-2xl p-5">
        <h2 className="text-[#475569] text-sm font-medium mb-3">Make a Payment</h2>
        <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {MOCK_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCard((prev) => (prev?.id === card.id ? null : card))}
                className={["flex items-center gap-3 p-3 rounded-xl border text-left", selectedCard?.id === card.id ? "border-[#00C9A7] bg-[#00C9A7]/10" : "border-[#E2E8F0]"].join(" ")}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: card.color ?? "#94A3B8" }}>
                  {card.institution.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] text-sm truncate">{card.name}</p>
                  <p className="text-[#64748B] text-xs font-mono">••••{card.last4} · {fmtCurrency(card.balance)} balance</p>
                </div>
              </button>
            ))}
          </div>

          <input
            type="number"
            inputMode="decimal"
            min="10"
            step="0.01"
            value={transferAmount}
            onChange={(e) => {
              setTransferAmount(e.target.value);
              setTransferAmountErr("");
            }}
            placeholder="Payment amount"
            className={["w-full bg-[#F8FAFC] text-[#0F172A] text-sm font-mono rounded-xl px-4 py-3 border", transferAmountErr ? "border-red-500" : "border-[#E2E8F0]"].join(" ")}
          />
          {transferAmountErr && <p className="text-red-400 text-xs">{transferAmountErr}</p>}

          <button type="submit" disabled={!selectedCard} className="w-full bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 disabled:opacity-40">
            {selectedCard ? `Pay ${selectedCard.name}` : "Select a card"}
          </button>
        </form>
      </section>
    </div>
  );
}
