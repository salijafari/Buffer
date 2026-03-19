'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

type Province = {
  code: string;
  name: string;
  creditLineEnabled: boolean;
};

const PROVINCES: Province[] = [
  { code: 'AB', name: 'Alberta',            creditLineEnabled: true  },
  { code: 'BC', name: 'British Columbia',   creditLineEnabled: true  },
  { code: 'MB', name: 'Manitoba',           creditLineEnabled: true  },
  { code: 'NB', name: 'New Brunswick',      creditLineEnabled: false },
  { code: 'NL', name: 'Newfoundland',       creditLineEnabled: false },
  { code: 'NS', name: 'Nova Scotia',        creditLineEnabled: false },
  { code: 'NT', name: 'Northwest Territories', creditLineEnabled: false },
  { code: 'NU', name: 'Nunavut',            creditLineEnabled: false },
  { code: 'ON', name: 'Ontario',            creditLineEnabled: true  },
  { code: 'PE', name: 'Prince Edward Island', creditLineEnabled: false },
  { code: 'QC', name: 'Quebec',             creditLineEnabled: true  },
  { code: 'SK', name: 'Saskatchewan',       creditLineEnabled: true  },
  { code: 'YT', name: 'Yukon',              creditLineEnabled: false },
];

type KycData = {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  dob: string;
  idType: 'passport' | 'drivers_license' | 'pr_card' | '';
  idFile: File | null;
};

type EligibilityOutcome = 'A' | 'B' | 'C' | null; // A=CreditLine, B=CreditBuilder, C=InProgress

// ─── Step meta ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Identity'   },
  { id: 2, label: 'Province'   },
  { id: 3, label: 'Bank'       },
  { id: 4, label: 'Verify'     },
  { id: 5, label: 'Eligibility'},
  { id: 6, label: 'Credit Builder'},
  { id: 7, label: 'Setup'      },
] as const;

// ─── Root component ───────────────────────────────────────────────────────────

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep]               = useState(1);
  const [kyc, setKyc]                 = useState<KycData>({
    address: '', city: '', province: '', postalCode: '', dob: '', idType: '', idFile: null,
  });
  const [plaidConnected, setPlaidConnected]   = useState(false);
  const [verifyLoading, setVerifyLoading]     = useState(false);
  const [eligibility, setEligibility]         = useState<EligibilityOutcome>(null);
  const [padAccepted, setPadAccepted]         = useState(false);
  const [cbAcknowledged, setCbAcknowledged]   = useState(false);

  function next() { setStep(s => Math.min(s + 1, 7)); }

  // step 5 eligibility decision
  async function runEligibility() {
    setVerifyLoading(true);
    // TODO: replace with real api.kyc.check() + api.credit.softPull()
    await new Promise(r => setTimeout(r, 2000));
    const province = PROVINCES.find(p => p.code === kyc.province);
    // If province doesn't support credit line → Outcome B
    setEligibility(province?.creditLineEnabled ? 'A' : 'B');
    setVerifyLoading(false);
    next(); // → step 5 results
  }

  function handleFinish() {
    // TODO (onboarding_completed integration): When this buffer-app is connected to Clerk,
    // call the Clerk Backend API (or a /api/complete-onboarding server action) here to set
    // user.unsafeMetadata.onboarding_completed = true on the Clerk user record.
    // The marketing SPA's /onboarding route reads this flag to distinguish new vs returning
    // users and route them accordingly (see src/app/pages/Onboarding.tsx in the SPA).

    // Route based on outcome — never a rejection screen
    if (eligibility === 'A') router.push('/dashboard');
    else router.push('/dashboard'); // Outcome B still routes to dashboard, credit builder tab visible
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {/* Progress header */}
      <header className="px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#00C9A7] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M6 22C6 22 10 6 14 6C18 6 22 22 22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M9 16H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Buffer</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5" role="list" aria-label="Onboarding progress">
          {STEPS.map(s => (
            <div
              key={s.id}
              role="listitem"
              aria-current={step === s.id ? 'step' : undefined}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                step === s.id  ? 'bg-[#00C9A7] flex-[2]' :
                step > s.id    ? 'bg-[#00C9A7]/50 flex-1' :
                                 'bg-[#2A3040] flex-1',
              ].join(' ')}
            />
          ))}
        </div>

        <p className="text-[#4A5568] text-xs mt-2">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </header>

      {/* Step content */}
      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        {step === 1 && <StepKyc kyc={kyc} setKyc={setKyc} onNext={next} />}
        {step === 2 && <StepProvince kyc={kyc} setKyc={setKyc} onNext={next} />}
        {step === 3 && (
          <StepPlaid
            connected={plaidConnected}
            onConnect={() => { setPlaidConnected(true); }}
            onNext={next}
          />
        )}
        {step === 4 && (
          <StepVerify loading={verifyLoading} onRun={runEligibility} />
        )}
        {step === 5 && (
          <StepEligibility outcome={eligibility} onNext={next} />
        )}
        {step === 6 && (
          <StepCreditBuilder acknowledged={cbAcknowledged} onAcknowledge={() => setCbAcknowledged(true)} onNext={next} />
        )}
        {step === 7 && (
          <StepPad accepted={padAccepted} onAccept={() => setPadAccepted(true)} onFinish={handleFinish} />
        )}
      </main>
    </div>
  );
}

// ─── Step 1: KYC ─────────────────────────────────────────────────────────────

function StepKyc({ kyc, setKyc, onNext }: {
  kyc: KycData;
  setKyc: React.Dispatch<React.SetStateAction<KycData>>;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof KycData, string>>>({});

  function set(key: keyof KycData, value: string | File | null) {
    setKyc(prev => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, idFile: 'File must be under 10 MB' }));
      return;
    }
    set('idFile', file);
    setErrors(prev => ({ ...prev, idFile: undefined }));
  }

  function handleNext() {
    const errs: typeof errors = {};
    if (!kyc.address.trim())    errs.address    = 'Required';
    if (!kyc.city.trim())       errs.city       = 'Required';
    if (!kyc.postalCode.trim()) errs.postalCode = 'Required';
    if (!kyc.dob)               errs.dob        = 'Required';
    else {
      const age = (Date.now() - new Date(kyc.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) errs.dob = 'You must be at least 18 years old';
    }
    if (!kyc.idType)            errs.idType     = 'Required';
    if (!kyc.idFile)            errs.idFile     = 'Please upload your ID document';
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  }

  const inputCls = (key: keyof KycData) => [
    'w-full bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 outline-none',
    'border transition-colors placeholder:text-[#3D4A5C]',
    'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
    errors[key] ? 'border-red-500' : 'border-[#2A3040]',
  ].join(' ');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Verify your identity</h2>
        <p className="text-[#8B9CB6] text-sm">Required by Canadian financial regulations. Your information is encrypted and never sold.</p>
      </div>

      {/* Trust statement */}
      <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/20 rounded-xl p-4 flex gap-3">
        <LockIcon />
        <div>
          <p className="text-white text-sm font-medium">Your data is protected</p>
          <p className="text-[#8B9CB6] text-xs mt-0.5">256-bit encryption · SOC 2 Type II · PIPEDA compliant · No SIN collected</p>
        </div>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[#8B9CB6] text-sm font-medium">Street address</label>
        <input
          type="text" autoComplete="street-address"
          value={kyc.address} onChange={e => set('address', e.target.value)}
          placeholder="123 Main St" className={inputCls('address')}
        />
        {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8B9CB6] text-sm font-medium">City</label>
          <input
            type="text" autoComplete="address-level2"
            value={kyc.city} onChange={e => set('city', e.target.value)}
            placeholder="Vancouver" className={inputCls('city')}
          />
          {errors.city && <p className="text-red-400 text-xs">{errors.city}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[#8B9CB6] text-sm font-medium">Postal code</label>
          <input
            type="text" autoComplete="postal-code" inputMode="text"
            value={kyc.postalCode}
            onChange={e => set('postalCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="V6B 1A1" className={inputCls('postalCode')}
          />
          {errors.postalCode && <p className="text-red-400 text-xs">{errors.postalCode}</p>}
        </div>
      </div>

      {/* DOB */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[#8B9CB6] text-sm font-medium">Date of birth</label>
        <input
          type="date" autoComplete="bday"
          value={kyc.dob} onChange={e => set('dob', e.target.value)}
          max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
          className={inputCls('dob')}
        />
        {errors.dob && <p className="text-red-400 text-xs">{errors.dob}</p>}
      </div>

      {/* ID type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[#8B9CB6] text-sm font-medium">ID document type</label>
        <select
          value={kyc.idType}
          onChange={e => set('idType', e.target.value as KycData['idType'])}
          className={[inputCls('idType'), 'cursor-pointer'].join(' ')}
        >
          <option value="">Select document…</option>
          <option value="passport">Canadian Passport</option>
          <option value="drivers_license">Driver&apos;s License</option>
          <option value="pr_card">Permanent Resident Card</option>
        </select>
        {errors.idType && <p className="text-red-400 text-xs">{errors.idType}</p>}
      </div>

      {/* ID upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[#8B9CB6] text-sm font-medium">Upload document <span className="text-[#4A5568] font-normal">(JPG, PNG or PDF, max 10 MB)</span></label>
        <label className={[
          'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors',
          errors.idFile ? 'border-red-500' : 'border-[#2A3040] hover:border-[#00C9A7]/40',
        ].join(' ')}>
          <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="sr-only" />
          <UploadIcon />
          <span className="text-sm text-[#8B9CB6]">
            {kyc.idFile ? kyc.idFile.name : 'Tap to upload'}
          </span>
          {kyc.idFile && <span className="text-xs text-[#4A5568]">{(kyc.idFile.size / 1024).toFixed(0)} KB</span>}
        </label>
        {errors.idFile && <p className="text-red-400 text-xs">{errors.idFile}</p>}
      </div>

      <p className="text-[#4A5568] text-xs">
        <strong className="text-[#8B9CB6]">Important:</strong> Buffer never collects your Social Insurance Number (SIN). Only the documents listed above are accepted.
      </p>

      <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
    </div>
  );
}

// ─── Step 2: Province eligibility ────────────────────────────────────────────

function StepProvince({ kyc, setKyc, onNext }: {
  kyc: KycData;
  setKyc: React.Dispatch<React.SetStateAction<KycData>>;
  onNext: () => void;
}) {
  const [error, setError] = useState('');
  const selected = PROVINCES.find(p => p.code === kyc.province);

  function handleNext() {
    if (!kyc.province) { setError('Please select your province'); return; }
    setError('');
    onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Where are you located?</h2>
        <p className="text-[#8B9CB6] text-sm">Buffer is available across Canada. Some features vary by province.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[#8B9CB6] text-sm font-medium">Province or territory</label>
        <select
          value={kyc.province}
          onChange={e => { setKyc(prev => ({ ...prev, province: e.target.value })); setError(''); }}
          className={[
            'w-full bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 outline-none cursor-pointer',
            'border transition-colors',
            'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
            error ? 'border-red-500' : 'border-[#2A3040]',
          ].join(' ')}
        >
          <option value="">Select province…</option>
          {PROVINCES.map(p => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {selected && (
        <div className={[
          'rounded-xl p-4 border',
          selected.creditLineEnabled
            ? 'bg-[#00C9A7]/10 border-[#00C9A7]/20'
            : 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
        ].join(' ')}>
          {selected.creditLineEnabled ? (
            <>
              <p className="text-white text-sm font-medium">Buffer Credit Line available in {selected.name}</p>
              <p className="text-[#8B9CB6] text-xs mt-1">You can access all Buffer features including the revolving credit line.</p>
            </>
          ) : (
            <>
              <p className="text-[#F59E0B] text-sm font-medium">Credit Line coming soon to {selected.name}</p>
              <p className="text-[#8B9CB6] text-xs mt-1">You&apos;ll be enrolled in Credit Builder to start improving your score right away.</p>
            </>
          )}
        </div>
      )}

      <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
    </div>
  );
}

// ─── Step 3: Plaid connection ─────────────────────────────────────────────────

function StepPlaid({ connected, onConnect, onNext }: {
  connected: boolean;
  onConnect: () => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    // TODO: open Plaid Link SDK
    await new Promise(r => setTimeout(r, 1500));
    onConnect();
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Connect your bank</h2>
        <p className="text-[#8B9CB6] text-sm">Buffer uses Plaid to securely read your income and transaction history. We never store your credentials.</p>
      </div>

      {/* Trust pre-screen */}
      <div className="flex flex-col gap-3">
        {[
          { icon: '🔒', title: 'Read-only access', desc: 'Buffer can never move money without your PAD authorization.' },
          { icon: '🏦', title: 'Bank-grade encryption', desc: 'Plaid is trusted by millions of Canadians and used by major banks.' },
          { icon: '🗑️', title: 'Delete anytime', desc: 'Revoke access instantly from your account settings.' },
        ].map(item => (
          <div key={item.icon} className="flex gap-3 bg-[#1A1F2E] rounded-xl p-4">
            <span className="text-xl leading-none mt-0.5">{item.icon}</span>
            <div>
              <p className="text-white text-sm font-medium">{item.title}</p>
              <p className="text-[#8B9CB6] text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {connected ? (
        <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircleIcon />
          <p className="text-[#00C9A7] text-sm font-medium">Bank account connected</p>
        </div>
      ) : null}

      {!connected ? (
        <PrimaryButton onClick={handleConnect} disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2"><SpinnerIcon />Connecting…</span>
          ) : 'Connect with Plaid'}
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      )}
    </div>
  );
}

// ─── Step 4: Income + credit pull ────────────────────────────────────────────

function StepVerify({ loading, onRun }: { loading: boolean; onRun: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Verify income &amp; credit</h2>
        <p className="text-[#8B9CB6] text-sm">We&apos;ll run a <strong className="text-white">soft credit pull</strong> (never affects your score) and verify your income from connected accounts.</p>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { label: 'Soft credit check', note: 'Equifax & TransUnion · No score impact' },
          { label: 'Income verification', note: 'Analysing 90 days of transactions' },
          { label: 'Debt analysis',       note: 'Existing balances & interest rates' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 bg-[#1A1F2E] rounded-xl px-4 py-3">
            <div className={[
              'w-2 h-2 rounded-full flex-shrink-0',
              loading ? 'bg-[#00C9A7] animate-pulse' : 'bg-[#2A3040]',
            ].join(' ')} />
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[#4A5568] text-xs">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={onRun} disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2"><SpinnerIcon />Analysing…</span>
        ) : 'Run Verification'}
      </PrimaryButton>
    </div>
  );
}

// ─── Step 5: Eligibility result ───────────────────────────────────────────────

function StepEligibility({ outcome, onNext }: { outcome: EligibilityOutcome; onNext: () => void }) {
  if (!outcome) return null;

  const isA = outcome === 'A';
  return (
    <div className="flex flex-col gap-6">
      <div className={[
        'rounded-2xl p-6 flex flex-col items-center text-center gap-3',
        isA ? 'bg-[#00C9A7]/10 border border-[#00C9A7]/20' : 'bg-[#F59E0B]/10 border border-[#F59E0B]/20',
      ].join(' ')}>
        <span className="text-4xl">{isA ? '🎉' : '🌱'}</span>
        <h2 className="text-white text-xl font-bold">
          {isA ? "You're approved!" : "Let's build your credit first"}
        </h2>
        <p className="text-[#8B9CB6] text-sm leading-relaxed">
          {isA
            ? "You qualify for a Buffer Credit Line. We'll set up your account so you can start paying down debt faster."
            : "Based on your credit profile, we'll enrol you in Credit Builder — a proven path to improve your score and unlock the full credit line."}
        </p>
      </div>

      {!isA && (
        <div className="bg-[#1A1F2E] rounded-xl p-4">
          <p className="text-white text-sm font-medium mb-2">Your Credit Builder path</p>
          <ol className="flex flex-col gap-2">
            {['Monthly on-time payments build positive history', 'Score typically improves in 3–6 months', 'Automatically graduates to full Credit Line when eligible'].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#8B9CB6]">
                <span className="text-[#00C9A7] font-bold flex-shrink-0">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      <PrimaryButton onClick={onNext}>
        {isA ? 'Set up my account' : 'Start Credit Builder'}
      </PrimaryButton>
    </div>
  );
}

// ─── Step 6: Credit Builder mandatory disclosure ──────────────────────────────

function StepCreditBuilder({ acknowledged, onAcknowledge, onNext }: {
  acknowledged: boolean;
  onAcknowledge: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">About Credit Builder</h2>
        <p className="text-[#8B9CB6] text-sm">Please read this important information before proceeding.</p>
      </div>

      <div className="bg-[#1A1F2E] rounded-xl p-5 flex flex-col gap-4 max-h-64 overflow-y-auto text-sm text-[#8B9CB6] leading-relaxed">
        <p>
          <strong className="text-white">What is Credit Builder?</strong> Buffer Credit Builder is a secured credit facility that reports monthly payments to Equifax and TransUnion. Each on-time payment adds a positive trade line to your credit report.
        </p>
        <p>
          <strong className="text-white">How it works:</strong> A small monthly amount (as low as $10) is held in a secured account. This amount is reported as a credit obligation and paid monthly, building your history. No interest is charged on the secured portion.
        </p>
        <p>
          <strong className="text-white">Fees:</strong> Buffer charges a flat monthly subscription fee (see your plan details). There are no hidden fees. The secured deposit is returned if you close your account in good standing.
        </p>
        <p>
          <strong className="text-white">Cancellation:</strong> You may cancel Credit Builder with 30 days&apos; written notice. PAD payments during the notice period will continue. See your Pre-Authorized Debit agreement for full terms.
        </p>
        <p>
          <strong className="text-white">Credit impact:</strong> Late or missed payments will be reported negatively. Buffer is not responsible for changes to your credit score. Past results do not guarantee future score improvements.
        </p>
        <p>
          <strong className="text-white">Graduation:</strong> When your score meets the threshold for your province, Buffer will notify you and automatically offer a transition to the full Credit Line. You are not obligated to accept.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={e => { if (e.target.checked) onAcknowledge(); }}
          className="mt-0.5 w-4 h-4 accent-[#00C9A7] cursor-pointer"
        />
        <span className="text-sm text-[#8B9CB6]">
          I have read and understood the Credit Builder terms, including the 30-day cancellation notice requirement.
        </span>
      </label>

      <PrimaryButton onClick={onNext} disabled={!acknowledged}>
        I understand — Continue
      </PrimaryButton>
    </div>
  );
}

// ─── Step 7: PAD setup ────────────────────────────────────────────────────────

function StepPad({ accepted, onAccept, onFinish }: {
  accepted: boolean;
  onAccept: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white text-xl font-bold mb-1">Authorize payments</h2>
        <p className="text-[#8B9CB6] text-sm">Set up Pre-Authorized Debit (PAD) to automate your monthly Buffer payments.</p>
      </div>

      <div className="bg-[#1A1F2E] rounded-xl p-5 flex flex-col gap-3">
        <p className="text-[#8B9CB6] text-xs leading-relaxed">
          <strong className="text-white">Pre-Authorized Debit Agreement</strong><br/>
          By accepting, you authorize Buffer Financial Inc. to debit your connected bank account for the agreed monthly amount on the payment date each month. This PAD is for{' '}
          <strong className="text-white">personal use</strong>.
        </p>
        <p className="text-[#8B9CB6] text-xs leading-relaxed">
          <strong className="text-white">Your rights:</strong> You have the right to cancel this PAD agreement at any time with a minimum of <strong className="text-white">30 days&apos; written notice</strong> before the next scheduled debit. Contact support@mybuffer.ca.
        </p>
        <p className="text-[#8B9CB6] text-xs leading-relaxed">
          For reimbursement of debits made in error, contact us within 90 days. This PAD is governed by the Payments Canada Rule H1. Powered by VoPay.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => { if (e.target.checked) onAccept(); }}
          className="mt-0.5 w-4 h-4 accent-[#00C9A7] cursor-pointer"
        />
        <span className="text-sm text-[#8B9CB6]">
          I authorize Buffer Financial Inc. to debit my account as described above and confirm I have read the PAD agreement including the 30-day cancellation notice requirement.
        </span>
      </label>

      <PrimaryButton onClick={onFinish} disabled={!accepted}>
        Authorize &amp; Finish Setup
      </PrimaryButton>
    </div>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function PrimaryButton({
  children, onClick, disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 mt-2 hover:bg-[#00B496] active:bg-[#00A085] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
    >
      {children}
    </button>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="23.562" />
    </svg>
  );
}
