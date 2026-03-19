import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useUser, useClerk } from '@clerk/react';

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'home',    label: 'Home',    path: '/dashboard',        icon: HomeIcon    },
  { id: 'payoff',  label: 'Payoff',  path: '/dashboard/payoff', icon: PayoffIcon  },
  { id: 'ai',      label: 'AI',      path: '/dashboard/ai',     icon: AiIcon      },
  { id: 'credit',  label: 'Credit',  path: '/dashboard/credit', icon: CreditIcon  },
  { id: 'account', label: 'Account', path: '/dashboard/account',icon: AccountIcon },
] as const;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CARDS = [
  { name: 'TD Visa',        balance: 4200, limit: 5000, apr: 19.99 },
  { name: 'Scotiabank MC',  balance: 3800, limit: 8000, apr: 22.99 },
  { name: 'CIBC Visa',      balance: 3500, limit: 6500, apr: 20.99 },
] as const;

const TOTAL_DEBT = MOCK_CARDS.reduce((s, c) => s + c.balance, 0); // 11500

// Months to zero with $500/month at 14.99% Buffer APR
const MONTHS_WITH_BUFFER = 27;
const INTEREST_SAVED     = 4040;
const DEBT_FREE_DATE      = new Date(Date.now() + MONTHS_WITH_BUFFER * 30 * 86400000)
  .toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });

// ─── Root component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useUser();
  const { signOut } = useClerk();

  const activeTab = TABS.find(t => location.pathname === t.path)?.id ?? 'home';

  const firstName = user?.firstName ?? 'there';

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {/* Top bar */}
      <header className="px-4 pt-safe-top pt-5 pb-4 max-w-lg mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00C9A7] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M6 22C6 22 10 6 14 6C18 6 22 22 22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M9 16H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Buffer</span>
        </div>
        <button
          onClick={() => signOut().then(() => navigate('/onboarding', { replace: true }))}
          className="text-[#4A5568] text-xs hover:text-[#8B9CB6] transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Main content — switches by active tab */}
      <main className="flex-1 overflow-y-auto pb-24 max-w-lg mx-auto w-full px-4">
        {activeTab === 'home'    && <HomeTab firstName={firstName} />}
        {activeTab === 'payoff'  && <PayoffTab />}
        {activeTab === 'ai'      && <AiTab />}
        {activeTab === 'credit'  && <CreditTab />}
        {activeTab === 'account' && <AccountTab firstName={firstName} email={user?.primaryEmailAddress?.emailAddress ?? ''} signOut={() => signOut().then(() => navigate('/onboarding', { replace: true }))} />}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-[#0F1117] border-t border-[#1A1F2E] pb-safe-bottom"
        aria-label="Main navigation"
      >
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, path, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center gap-0.5 py-3 focus-visible:outline-none"
                aria-current={active ? 'page' : undefined}
              >
                <Icon active={active} />
                <span className={['text-[10px] font-medium transition-colors', active ? 'text-[#00C9A7]' : 'text-[#4A5568]'].join(' ')}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="text-white text-2xl font-bold">Hey, {firstName} 👋</h1>

      {/* Debt-free hero card */}
      <div className="bg-gradient-to-br from-[#00C9A7]/20 to-[#0F1117] border border-[#00C9A7]/30 rounded-2xl p-5">
        <p className="text-[#00C9A7] text-xs font-semibold uppercase tracking-wider mb-1">Debt-Free Date</p>
        <p className="text-white text-3xl font-bold font-mono">{DEBT_FREE_DATE}</p>
        <p className="text-[#8B9CB6] text-sm mt-1">{MONTHS_WITH_BUFFER} months · Save <span className="text-white font-semibold">${INTEREST_SAVED.toLocaleString()}</span> in interest</p>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-[#1A1F2E] rounded-full overflow-hidden">
          <div className="h-2 bg-[#00C9A7] rounded-full" style={{ width: '4%' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[#4A5568] text-xs font-mono">${TOTAL_DEBT.toLocaleString()} remaining</span>
          <span className="text-[#4A5568] text-xs">$0</span>
        </div>
      </div>

      {/* Buffer credit line */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[#8B9CB6] text-xs font-medium">Buffer Credit Line</p>
            <p className="text-white text-xl font-bold font-mono">$5,000</p>
          </div>
          <div className="text-right">
            <p className="text-[#8B9CB6] text-xs">APR</p>
            <p className="text-[#00C9A7] text-sm font-bold">14.99%</p>
          </div>
        </div>
        <div className="h-1.5 bg-[#0F1117] rounded-full overflow-hidden">
          <div className="h-1.5 bg-[#00C9A7] rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-[#4A5568] text-xs mt-1">$0 used · $5,000 available</p>
      </div>

      {/* Your cards */}
      <div>
        <p className="text-[#8B9CB6] text-xs font-semibold uppercase tracking-wider mb-2">Your Cards</p>
        <div className="flex flex-col gap-2">
          {MOCK_CARDS.map(card => {
            const util = Math.round((card.balance / card.limit) * 100);
            const color = util > 80 ? '#EF4444' : util > 50 ? '#F59E0B' : '#00C9A7';
            return (
              <div key={card.name} className="bg-[#1A1F2E] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{card.name}</p>
                  <p className="text-[#4A5568] text-xs">{card.apr}% APR</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-mono font-semibold">${card.balance.toLocaleString()}</p>
                  <p className="text-xs" style={{ color }}>{util}% used</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit score snapshot */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[#8B9CB6] text-xs font-medium">Credit Score</p>
          <p className="text-white text-2xl font-bold font-mono">682</p>
          <p className="text-[#F59E0B] text-xs">Fair · Improving</p>
        </div>
        <div className="text-right text-[#4A5568] text-xs">
          <p>via Equifax</p>
          <p>Updated Mar 2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── Payoff tab (placeholder) ─────────────────────────────────────────────────

function PayoffTab() {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="text-white text-2xl font-bold">Payoff Planner</h1>
      <div className="bg-[#1A1F2E] rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-[#8B9CB6] text-sm">Adjust your monthly payment to see how fast you can become debt-free.</p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-[#4A5568]">
            <span>Monthly payment</span>
            <span className="text-white font-mono">$500</span>
          </div>
          <input type="range" min={210} max={1400} step={10} defaultValue={500}
            className="w-full accent-[#00C9A7]" />
        </div>
        <div className="h-px bg-[#2A3040]" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Debt-free', value: DEBT_FREE_DATE },
            { label: 'Interest saved', value: `$${INTEREST_SAVED.toLocaleString()}` },
            { label: 'vs. minimum payment', value: '60 fewer months', span: true },
          ].map(item => (
            <div key={item.label} className={'bg-[#0F1117] rounded-xl p-3' + (item.span ? ' col-span-2' : '')}>
              <p className="text-[#4A5568] text-xs">{item.label}</p>
              <p className="text-white text-sm font-semibold font-mono mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI tab (placeholder) ─────────────────────────────────────────────────────

function AiTab() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  function send() {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMessages(prev => [
      ...prev,
      { role: 'user', text: q },
      { role: 'ai', text: "I'm your Buffer AI advisor. Based on your profile, I'd recommend focusing on your TD Visa first (highest utilization at 84%). Would you like a detailed payoff plan?" },
    ]);
  }

  return (
    <div className="flex flex-col gap-4 pt-2 h-full">
      <h1 className="text-white text-2xl font-bold">Buffer AI</h1>

      {/* Proactive insight */}
      <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/20 rounded-xl p-4">
        <p className="text-[#00C9A7] text-xs font-semibold uppercase tracking-wider mb-1">Insight</p>
        <p className="text-white text-sm">You can save <strong>$4,040 in interest</strong> by increasing your monthly payment by just $50.</p>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            {['How do I pay off my TD Visa fastest?', 'What\'s my debt-free date?', 'Explain the avalanche method', 'How is my credit score calculated?'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} className="bg-[#1A1F2E] rounded-xl px-4 py-3 text-left text-sm text-[#8B9CB6] hover:text-white hover:border-[#00C9A7] border border-transparent transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={['flex', m.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}>
            <div className={['max-w-[85%] rounded-2xl px-4 py-3 text-sm', m.role === 'user' ? 'bg-[#00C9A7] text-[#0F1117]' : 'bg-[#1A1F2E] text-white'].join(' ')}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="Ask Buffer AI…"
          className="flex-1 bg-[#1A1F2E] border border-[#2A3040] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#00C9A7] placeholder:text-[#3D4A5C]"
        />
        <button onClick={send} className="bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl px-4 hover:bg-[#00B496] transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Credit tab (placeholder) ─────────────────────────────────────────────────

function CreditTab() {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="text-white text-2xl font-bold">Credit</h1>

      {/* Score gauge placeholder */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5 flex flex-col items-center gap-3">
        <p className="text-[#8B9CB6] text-xs font-semibold uppercase tracking-wider">Your Credit Score</p>
        <p className="text-white text-5xl font-bold font-mono">682</p>
        <div className="flex gap-1 text-xs">
          {(['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] as const).map(band => (
            <span key={band} className={['px-2 py-0.5 rounded-full', band === 'Fair' ? 'bg-[#F59E0B] text-[#0F1117] font-semibold' : 'text-[#4A5568]'].join(' ')}>{band}</span>
          ))}
        </div>
        <p className="text-[#4A5568] text-xs">via Equifax · Updated Mar 2026</p>
      </div>

      {/* Graduation path */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5">
        <p className="text-white text-sm font-semibold mb-3">Path to Credit Line unlock</p>
        <div className="flex justify-between text-xs text-[#4A5568] mb-1.5">
          <span>Current: 682</span>
          <span>Target: 660 (Good)</span>
        </div>
        <div className="h-2 bg-[#0F1117] rounded-full overflow-hidden">
          <div className="h-2 bg-[#00C9A7] rounded-full" style={{ width: '80%' }} />
        </div>
        <p className="text-[#8B9CB6] text-xs mt-2">Already above threshold! Credit Line upgrade available.</p>
      </div>

      {/* Trade lines */}
      <div>
        <p className="text-[#8B9CB6] text-xs font-semibold uppercase tracking-wider mb-2">Trade Lines</p>
        {[
          { name: 'Buffer Credit Builder', status: 'Active', since: 'Oct 2025', payment: 'On-time' },
          { name: 'TD Visa',               status: 'External', since: 'Jan 2022', payment: 'On-time' },
          { name: 'Scotiabank MC',         status: 'External', since: 'Mar 2020', payment: 'On-time' },
        ].map(tl => (
          <div key={tl.name} className="bg-[#1A1F2E] rounded-xl px-4 py-3 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-sm font-medium">{tl.name}</p>
                <p className="text-[#4A5568] text-xs">Since {tl.since}</p>
              </div>
              <span className={['text-xs font-semibold px-2 py-0.5 rounded-full', tl.status === 'Active' ? 'bg-[#00C9A7]/20 text-[#00C9A7]' : 'bg-[#2A3040] text-[#8B9CB6]'].join(' ')}>
                {tl.status}
              </span>
            </div>
            <p className="text-[#00C9A7] text-xs mt-1">✓ {tl.payment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account tab ──────────────────────────────────────────────────────────────

function AccountTab({ firstName, email, signOut }: { firstName: string; email: string; signOut: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="text-white text-2xl font-bold">Account</h1>

      {/* Profile header */}
      <div className="bg-[#1A1F2E] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#00C9A7] flex items-center justify-center text-[#0F1117] text-xl font-bold flex-shrink-0">
          {firstName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white text-base font-semibold">{firstName}</p>
          <p className="text-[#4A5568] text-sm">{email || 'your email'}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden">
        {[
          { label: 'Subscription', sub: 'Buffer Pro · $14.99/mo' },
          { label: 'Notifications', sub: 'Payments, alerts, tips' },
          { label: 'Security', sub: 'Password · Passkey' },
          { label: 'Connected Accounts', sub: '1 bank connected via Plaid' },
          { label: 'Help & Support', sub: 'FAQ · Email · Chat' },
        ].map((item, i, arr) => (
          <div key={item.label} className={['flex items-center justify-between px-5 py-4', i < arr.length - 1 ? 'border-b border-[#0F1117]' : ''].join(' ')}>
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[#4A5568] text-xs">{item.sub}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button onClick={signOut} className="w-full bg-[#1A1F2E] border border-red-500/20 text-red-400 text-sm font-medium rounded-2xl py-4 hover:bg-red-500/10 transition-colors">
        Sign out
      </button>
    </div>
  );
}

// ─── Tab icons ────────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C9A7' : '#4A5568'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function PayoffIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C9A7' : '#4A5568'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function AiIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C9A7' : '#4A5568'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function CreditIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C9A7' : '#4A5568'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}
function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C9A7' : '#4A5568'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
