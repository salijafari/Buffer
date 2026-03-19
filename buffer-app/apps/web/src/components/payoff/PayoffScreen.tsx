'use client';

import { useState, useCallback } from 'react';
import { DebtFreeChart } from '../charts/DebtFreeChart';
import { FINANCE } from '@/lib/finance';
import type { TimelineOutput, CardData, SimulationResult } from '../../types/timeline';

// ─── Mock data ────────────────────────────────────────────────────────────────

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
  { id: '1', name: 'TD Cashback Visa',     last4: '4242', balance: 6800, apr: 0.1999, limit: 10000, institution: 'TD',   color: '#00A651' },
  { id: '2', name: 'Scotiabank Gold Amex', last4: '8891', balance: 3200, apr: 0.2114, limit: 5000,  institution: 'BNS',  color: '#EC0926' },
  { id: '3', name: 'CIBC Visa Dividend',   last4: '3377', balance: 1500, apr: 0.1999, limit: 3000,  institution: 'CIBC', color: '#C31E2E' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(n: number, d = 0): string {
  return n.toLocaleString('en-CA', {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: d, maximumFractionDigits: d,
  });
}

function calcFuture3Only(
  balance: number, bufferAPR: number, payment: number,
): SimulationResult {
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

  return {
    monthsToZero: months,
    totalInterest,
    totalPaid,
    balanceArray,
    debtFreeDate,
    monthlyPayment: payment,
  };
}

// ─── Transfer Confirmation Modal ──────────────────────────────────────────────

function TransferModal({
  card,
  amount,
  onConfirm,
  onCancel,
}: {
  card: CardData;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onConfirm();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div>
          <h2 id="transfer-title" className="text-[#0F172A] text-lg font-bold">Confirm Payment</h2>
          <p className="text-[#475569] text-sm mt-1">
            This will initiate a transfer from your connected bank via PAD.
          </p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col gap-3">
          <Row label="From" value="Royal Bank of Canada ••••7823" />
          <Row label="To" value={`${card.name} ••••${card.last4}`} />
          <div className="border-t border-[#E2E8F0] pt-3">
            <Row label="Amount" value={fmt$(amount, 2)} bold />
          </div>
          <p className="text-[#64748B] text-xs">
            Funds typically arrive in 1–2 business days. Subject to PAD agreement terms.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-[#475569] text-sm font-medium hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0F1117] text-sm font-semibold hover:bg-[#00B496] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon /> Sending…
              </span>
            ) : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#64748B] text-sm">{label}</span>
      <span className={['text-sm font-mono', bold ? 'text-[#0F172A] font-bold' : 'text-[#475569]'].join(' ')}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type AutoMode = 'off' | 'minimum' | 'recommended' | 'custom';

export function PayoffScreen() {
  const [timeline, setTimeline] = useState<TimelineOutput>(MOCK_TIMELINE);
  const [adjustedPayment, setAdjustedPayment] = useState(MOCK_TIMELINE.recommendedPayment);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAmountErr, setTransferAmountErr] = useState('');
  const [autoMode, setAutoMode] = useState<AutoMode>('off');
  const [modal, setModal] = useState<{ card: CardData; amount: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const totalDebt = MOCK_CARDS.reduce((s, c) => s + c.balance, 0);

  const handlePaymentChange = useCallback((payment: number) => {
    setAdjustedPayment(payment);
    const newF3 = calcFuture3Only(totalDebt, FINANCE.BUFFER_APR_DEFAULT, payment);
    setTimeline(prev => ({ ...prev, future3: newF3 }));
  }, [totalDebt]);

  function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!selectedCard) return;
    if (!transferAmount || isNaN(amount) || amount <= 0) {
      setTransferAmountErr('Enter a valid amount');
      return;
    }
    if (amount > selectedCard.balance) {
      setTransferAmountErr(`Max ${fmt$(selectedCard.balance, 2)}`);
      return;
    }
    if (amount < 10) {
      setTransferAmountErr('Minimum transfer is $10.00');
      return;
    }
    setTransferAmountErr('');
    setModal({ card: selectedCard, amount });
  }

  function handleConfirmed() {
    setModal(null);
    setSuccessMsg(`${fmt$(modal!.amount, 2)} payment to ${modal!.card.name} initiated`);
    setTransferAmount('');
    setSelectedCard(null);
    setTimeout(() => setSuccessMsg(''), 5000);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      {modal && (
        <TransferModal
          card={modal.card}
          amount={modal.amount}
          onConfirm={handleConfirmed}
          onCancel={() => setModal(null)}
        />
      )}

      {successMsg && (
        <div
          role="status"
          className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#00C9A7] text-[#0F1117] text-sm font-semibold rounded-full px-5 py-2.5 shadow-xl"
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[#0F172A] text-2xl font-bold">Payoff Planner</h1>
        <p className="text-[#475569] text-sm mt-1">Accelerate your path to debt freedom</p>
      </div>

      {/* ── Debt-Free Chart ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-5" aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="text-[#475569] text-sm font-medium mb-4">Debt-Free Timeline</h2>
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
        {timeline.aprFallbackApplied && (
          <p className="text-[#64748B] text-xs mt-3">
            * We used the Bank of Canada average card rate (21.14%) for one or more cards where the APR was unavailable.
          </p>
        )}
      </section>

      {/* ── Automation Controls ──────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-5" aria-labelledby="auto-heading">
        <h2 id="auto-heading" className="text-[#475569] text-sm font-medium mb-3">Auto-Pay</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            { mode: 'off',         label: 'Off' },
            { mode: 'minimum',     label: 'Minimum' },
            { mode: 'recommended', label: 'Recommended' },
            { mode: 'custom',      label: 'Custom' },
          ] as { mode: AutoMode; label: string }[]).map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAutoMode(mode)}
              aria-pressed={autoMode === mode}
              className={[
                'py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]',
                autoMode === mode
                  ? 'bg-[#00C9A7] text-[#0F1117]'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
        {autoMode !== 'off' && (
          <p className="text-[#64748B] text-xs mt-3">
            Auto-pay is <strong className="text-[#00C9A7]">{autoMode}</strong>. Buffer will initiate transfers via your PAD on the 1st of each month. You&apos;ll receive a notification 3 days before each debit.
          </p>
        )}
      </section>

      {/* ── Manual Transfer ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-5" aria-labelledby="transfer-heading">
        <h2 id="transfer-heading" className="text-[#475569] text-sm font-medium mb-3">Make a Payment</h2>

        <form onSubmit={handleTransferSubmit} noValidate className="flex flex-col gap-4">
          {/* Card select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#64748B] text-xs font-medium">Pay to card</label>
            <div className="flex flex-col gap-2">
              {MOCK_CARDS.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCard(prev => prev?.id === card.id ? null : card)}
                  aria-pressed={selectedCard?.id === card.id}
                  className={[
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]',
                    selectedCard?.id === card.id
                      ? 'border-[#00C9A7] bg-[#00C9A7]/10'
                      : 'border-[#E2E8F0] hover:border-[#3D4A5C]',
                  ].join(' ')}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F172A] text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: card.color ?? '#94A3B8' }}
                    aria-hidden="true"
                  >
                    {card.institution.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0F172A] text-sm truncate">{card.name}</p>
                    <p className="text-[#64748B] text-xs font-mono">
                      ••••{card.last4} · {fmt$(card.balance)} balance
                    </p>
                  </div>
                  {selectedCard?.id === card.id && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="transfer-amount" className="text-[#64748B] text-xs font-medium">
              Amount (CAD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-mono" aria-hidden="true">$</span>
              <input
                id="transfer-amount"
                type="number"
                inputMode="decimal"
                min="10"
                step="0.01"
                value={transferAmount}
                onChange={e => { setTransferAmount(e.target.value); setTransferAmountErr(''); }}
                placeholder="0.00"
                className={[
                  'w-full bg-[#F8FAFC] text-[#0F172A] text-sm font-mono rounded-xl pl-7 pr-4 py-3 border outline-none transition-colors placeholder:text-[#94A3B8]',
                  'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
                  transferAmountErr ? 'border-red-500' : 'border-[#E2E8F0]',
                ].join(' ')}
                aria-describedby={transferAmountErr ? 'amount-err' : undefined}
                aria-invalid={!!transferAmountErr}
              />
            </div>
            {transferAmountErr && (
              <p id="amount-err" role="alert" className="text-red-400 text-xs">{transferAmountErr}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedCard}
            className="w-full bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 hover:bg-[#00B496] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            {selectedCard ? `Pay ${selectedCard.name}` : 'Select a card'}
          </button>
        </form>
      </section>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.416" strokeDashoffset="23.562"/>
    </svg>
  );
}
