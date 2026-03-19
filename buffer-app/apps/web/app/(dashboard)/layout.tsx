'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Home',    icon: HomeIcon    },
  { href: '/dashboard/payoff', label: 'Payoff',  icon: PayoffIcon  },
  { href: '/dashboard/ai',     label: 'AI',      icon: AiIcon      },
  { href: '/dashboard/credit', label: 'Credit',  icon: CreditIcon  },
  { href: '/dashboard/account',label: 'Account', icon: AccountIcon },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0F1117]">
      {/* ── Sidebar (≥1024px) ─────────────────────────────────────────── */}
      <nav
        className="hidden lg:flex flex-col w-[220px] min-h-screen bg-[#1A1D27] border-r border-white/8 fixed left-0 top-0 bottom-0 z-50 py-8 px-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="mb-10 px-2">
          <span className="text-white font-bold text-xl tracking-tight">Buffer</span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-[#00C9A7]/12 text-[#00C9A7]'
                    : 'text-[#A0A8B8] hover:bg-white/5 hover:text-white',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-[220px] pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Bottom bar (<1024px) ──────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1A1D27] border-t border-white/8 z-50 flex items-center justify-around px-2"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 rounded-xl transition-all duration-150',
                active ? 'text-[#00C9A7]' : 'text-[#A0A8B8]',
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ─── Nav Icons (inline SVG — no external dependency) ───────────────────── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function PayoffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}
function AiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function CreditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  );
}
function AccountIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
