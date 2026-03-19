'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Section = 'main' | 'profile' | 'notifications' | 'security' | 'subscription' | 'support';

export function AccountScreen() {
  const [section, setSection] = useState<Section>('main');
  const router = useRouter();

  if (section !== 'main') {
    return <SubSection section={section} onBack={() => setSection('main')} />;
  }

  const menuItems: { label: string; icon: React.ReactNode; id: Section; desc: string }[] = [
    {
      id: 'profile',
      label: 'Profile',
      desc: 'Name, email, phone',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      desc: 'Push, email, SMS alerts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      desc: 'Password, passkey, 2FA',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      id: 'subscription',
      label: 'Subscription',
      desc: 'Plan, billing, PAD details',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      id: 'support',
      label: 'Help & Support',
      desc: 'FAQ, contact, report issue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* User header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] text-xl font-bold select-none">
          A
        </div>
        <div>
          <p className="text-white font-semibold">Account</p>
          <p className="text-[#4A5568] text-sm">Manage your Buffer account</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden divide-y divide-[#2A3040]">
        {menuItems.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#22293A] transition-colors text-left focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            <span className="text-[#4A5568]">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[#4A5568] text-xs">{item.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="w-full text-red-400 text-sm font-medium py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Sign Out
      </button>

      <p className="text-center text-[#2A3040] text-xs">Buffer v0.1.0 · mybuffer.ca</p>
    </div>
  );
}

function SubSection({ section, onBack }: { section: Section; onBack: () => void }) {
  const titles: Record<Section, string> = {
    main:          'Account',
    profile:       'Profile',
    notifications: 'Notifications',
    security:      'Security',
    subscription:  'Subscription',
    support:       'Help & Support',
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-xl bg-[#1A1F2E] flex items-center justify-center hover:bg-[#22293A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="text-white text-xl font-bold">{titles[section]}</h1>
      </div>
      <div className="bg-[#1A1F2E] rounded-2xl p-6 flex items-center justify-center text-[#4A5568] text-sm">
        {titles[section]} settings — Phase 4
      </div>
    </div>
  );
}
