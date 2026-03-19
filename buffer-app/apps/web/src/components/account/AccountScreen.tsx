'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'main' | 'profile' | 'notifications' | 'security' | 'subscription' | 'support';

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, label, id,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer">
      <span className="text-[#475569] text-sm">{label}</span>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]',
          checked ? 'bg-[#00C9A7]' : 'bg-[#CBD5E1]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </label>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="w-9 h-9 rounded-xl bg-white flex items-center justify-center hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled = false, variant = 'primary' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2',
        variant === 'primary'
          ? 'bg-[#00C9A7] text-[#0F1117] hover:bg-[#00B496] focus-visible:ring-[#00C9A7]'
          : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 focus-visible:ring-red-500',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function InputField({
  label, id, type = 'text', value, onChange, placeholder, autoComplete,
}: {
  label: string; id: string; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[#475569] text-sm font-medium">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="bg-[#F8FAFC] text-[#0F172A] text-sm rounded-xl px-4 py-3 border border-[#E2E8F0] outline-none focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 transition-colors placeholder:text-[#94A3B8]"
      />
    </div>
  );
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function ProfileSection({ onBack }: { onBack: () => void }) {
  const [firstName, setFirstName] = useState('Alex');
  const [lastName,  setLastName]  = useState('Chen');
  const [email,     setEmail]     = useState('alex.chen@example.com');
  const [phone,     setPhone]     = useState('(416) 555-1234');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] text-3xl font-bold">
          {firstName.charAt(0)}
        </div>
        <button type="button" className="text-xs text-[#00C9A7] hover:underline focus-visible:outline-none focus-visible:underline">
          Change photo
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="First name" id="fn" value={firstName} onChange={setFirstName} autoComplete="given-name" />
          <InputField label="Last name"  id="ln" value={lastName}  onChange={setLastName}  autoComplete="family-name" />
        </div>
        <InputField label="Email"    id="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <InputField label="Phone"    id="phone" type="tel"   value={phone} onChange={setPhone} autoComplete="tel"   />
      </div>

      {saved && (
        <p role="status" className="text-[#00C9A7] text-sm text-center">✓ Profile updated</p>
      )}

      <PrimaryButton onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </PrimaryButton>
    </div>
  );
}

function NotificationsSection({ onBack }: { onBack: () => void }) {
  const [push,    setPush]    = useState(true);
  const [email,   setEmail]   = useState(true);
  const [sms,     setSms]     = useState(false);
  const [payment, setPayment] = useState(true);
  const [score,   setScore]   = useState(true);
  const [promo,   setPromo]   = useState(false);
  const [plaid,   setPlaid]   = useState(true);

  const groups = [
    {
      title: 'Channels',
      items: [
        { id: 'push',  label: 'Push notifications', checked: push,  onChange: setPush  },
        { id: 'email', label: 'Email',              checked: email, onChange: setEmail },
        { id: 'sms',   label: 'SMS',                checked: sms,   onChange: setSms   },
      ],
    },
    {
      title: 'Events',
      items: [
        { id: 'payment', label: 'Payment processed or failed', checked: payment, onChange: setPayment },
        { id: 'score',   label: 'Credit score change',         checked: score,   onChange: setScore   },
        { id: 'plaid',   label: 'Plaid reconnection required', checked: plaid,   onChange: setPlaid   },
        { id: 'promo',   label: 'Tips & promotions',           checked: promo,   onChange: setPromo   },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Notifications</h1>
      </div>

      {groups.map(group => (
        <section key={group.title} className="bg-white rounded-2xl p-4 flex flex-col gap-4">
          <p className="text-[#64748B] text-xs font-semibold uppercase tracking-widest">{group.title}</p>
          {group.items.map(item => (
            <Toggle key={item.id} id={item.id} label={item.label} checked={item.checked} onChange={item.onChange} />
          ))}
        </section>
      ))}
    </div>
  );
}

function SecuritySection({ onBack }: { onBack: () => void }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFa,     setTwoFa]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');

  async function handleChangePassword() {
    if (!currentPw || !newPw) { setMsg('Fill in all fields'); return; }
    if (newPw !== confirmPw)  { setMsg('Passwords do not match'); return; }
    if (newPw.length < 8)     { setMsg('Minimum 8 characters'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setMsg('✓ Password updated');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setMsg(''), 4000);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Security</h1>
      </div>

      {/* Password change */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-[#64748B] text-xs font-semibold uppercase tracking-widest">Change Password</p>
        <InputField label="Current password" id="cpw" type="password" value={currentPw} onChange={setCurrentPw} autoComplete="current-password" />
        <InputField label="New password"     id="npw" type="password" value={newPw}     onChange={setNewPw}     autoComplete="new-password" />
        <InputField label="Confirm new"      id="cnf" type="password" value={confirmPw} onChange={setConfirmPw} autoComplete="new-password" />
        {msg && (
          <p role="status" className={['text-sm', msg.startsWith('✓') ? 'text-[#00C9A7]' : 'text-red-400'].join(' ')}>
            {msg}
          </p>
        )}
        <PrimaryButton onClick={handleChangePassword} disabled={saving}>
          {saving ? 'Updating…' : 'Update Password'}
        </PrimaryButton>
      </section>

      {/* Passkey */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-[#64748B] text-xs font-semibold uppercase tracking-widest">Passkey</p>
        <p className="text-[#475569] text-sm">Sign in with Face ID, Touch ID, or Windows Hello — no password needed.</p>
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-[#00C9A7] font-medium hover:underline focus-visible:outline-none focus-visible:underline"
          onClick={() => {/* TODO: WebAuthn register */}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add Passkey
        </button>
      </section>

      {/* 2FA */}
      <section className="bg-white rounded-2xl p-5">
        <Toggle
          id="2fa"
          label="Two-factor authentication (TOTP)"
          checked={twoFa}
          onChange={setTwoFa}
        />
        {twoFa && (
          <p className="text-[#64748B] text-xs mt-3">
            Scan the QR code in your authenticator app. TOTP setup available in next release.
          </p>
        )}
      </section>
    </div>
  );
}

function SubscriptionSection({ onBack }: { onBack: () => void }) {
  const [cancelling, setCancelling] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Subscription</h1>
      </div>

      {/* Current plan */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[#64748B] text-xs font-semibold uppercase tracking-widest">Current Plan</p>
          <span className="text-xs bg-[#00C9A7]/10 text-[#00C9A7] rounded-full px-2.5 py-0.5 font-medium">Active</span>
        </div>
        <div>
          <p className="text-[#0F172A] text-2xl font-bold">Buffer Pro</p>
          <p className="text-[#475569] text-sm mt-0.5 font-mono">$14.99/month</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Next billing',     value: 'Apr 1, 2026'     },
            { label: 'Payment method',   value: 'RBC ••••7823'    },
            { label: 'Credit Line APR',  value: '14.99%'          },
            { label: 'Credit Builder',   value: 'Included'        },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[#64748B] text-xs">{item.label}</p>
              <p className="text-[#0F172A] font-medium mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAD summary */}
      <section className="bg-white rounded-2xl p-5">
        <p className="text-[#64748B] text-xs font-semibold uppercase tracking-widest mb-3">PAD Agreement</p>
        <p className="text-[#475569] text-xs leading-relaxed">
          You have authorized Buffer Financial Inc. to debit your RBC account ending in 7823 for $14.99 monthly. To cancel, provide 30 days&apos; written notice to{' '}
          <a href="mailto:support@mybuffer.ca" className="text-[#00C9A7]">support@mybuffer.ca</a>.
          Payments Canada Rule H1 applies.
        </p>
      </section>

      {/* Cancel */}
      <PrimaryButton
        variant="danger"
        onClick={() => setCancelling(true)}
        disabled={cancelling}
      >
        {cancelling ? 'Opening cancellation…' : 'Cancel Subscription'}
      </PrimaryButton>
      {cancelling && (
        <p className="text-[#64748B] text-xs text-center">
          Your account will remain active for 30 days after notice. Check your email for next steps.
        </p>
      )}
    </div>
  );
}

function SupportSection({ onBack }: { onBack: () => void }) {
  const FAQs = [
    { q: 'What is Buffer Credit Builder?', a: 'A secured monthly payment that builds credit history reported to Equifax & TransUnion.' },
    { q: 'How do I connect a new bank?',   a: 'Go to Account → Profile → Connected Banks. You can add or remove accounts via Plaid.' },
    { q: 'Can I pause my subscription?',   a: 'Subscriptions can be paused once per year for up to 90 days. Contact support to initiate.' },
    { q: 'How is my APR determined?',      a: 'Your Buffer APR (14–18%) is set at signup based on your credit profile and province.' },
    { q: 'Is my data safe?',               a: 'Yes. Buffer uses 256-bit encryption, SOC 2 Type II compliance, and PIPEDA guidelines.' },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-[#0F172A] text-xl font-bold">Help & Support</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Email support',  href: 'mailto:support@mybuffer.ca', icon: '✉️' },
          { label: 'Live chat',      href: '#',                          icon: '💬' },
          { label: 'Report issue',   href: '#',                          icon: '🐛' },
          { label: 'Privacy policy', href: 'https://mybuffer.ca/privacy',icon: '🔒' },
        ].map(item => (
          <a
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            <span className="text-xl" aria-hidden="true">{item.icon}</span>
            <span className="text-[#475569] text-sm">{item.label}</span>
          </a>
        ))}
      </div>

      {/* FAQs */}
      <section className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]" aria-label="Frequently asked questions">
        <p className="px-5 py-3 text-[#64748B] text-xs font-semibold uppercase tracking-widest">FAQs</p>
        {FAQs.map((faq, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
            >
              <span className="text-[#0F172A] text-sm font-medium pr-4">{faq.q}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={['transition-transform flex-shrink-0', openFaq === i ? 'rotate-180' : ''].join(' ')}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-[#475569] text-sm leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      <p className="text-center text-[#64748B] text-xs">Buffer v0.1.0 · mybuffer.ca</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AccountScreen() {
  const [section, setSection] = useState<Section>('main');
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
      setLoggingOut(false);
    }
  }

  const menuItems: {
    label: string; id: Section; desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'profile',
      label: 'Profile',
      desc: 'Name, email, phone',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      desc: 'Push, email, SMS',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    },
    {
      id: 'security',
      label: 'Security',
      desc: 'Password, passkey, 2FA',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    },
    {
      id: 'subscription',
      label: 'Subscription',
      desc: 'Plan, billing, PAD',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    },
    {
      id: 'support',
      label: 'Help & Support',
      desc: 'FAQ, contact',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    },
  ];

  if (section === 'profile')       return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><ProfileSection       onBack={() => setSection('main')} /></div>;
  if (section === 'notifications')  return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><NotificationsSection  onBack={() => setSection('main')} /></div>;
  if (section === 'security')       return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SecuritySection       onBack={() => setSection('main')} /></div>;
  if (section === 'subscription')   return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SubscriptionSection   onBack={() => setSection('main')} /></div>;
  if (section === 'support')        return <div className="px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6"><SupportSection        onBack={() => setSection('main')} /></div>;

  return (
    <div className="flex flex-col gap-5 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      {/* User header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] text-2xl font-bold select-none" aria-hidden="true">
          A
        </div>
        <div>
          <p className="text-[#0F172A] font-semibold text-lg">Alex Chen</p>
          <p className="text-[#64748B] text-sm">alex.chen@example.com</p>
        </div>
      </div>

      {/* Menu */}
      <nav aria-label="Account sections">
        <ul className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSection(item.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F1F5F9] transition-colors text-left focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
              >
                <span className="text-[#64748B]" aria-hidden="true">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] text-sm font-medium">{item.label}</p>
                  <p className="text-[#64748B] text-xs">{item.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full text-red-400 text-sm font-medium py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loggingOut ? 'Signing out…' : 'Sign Out'}
      </button>

      <p className="text-center text-[#64748B] text-xs">Buffer v0.1.0 · mybuffer.ca</p>
    </div>
  );
}
