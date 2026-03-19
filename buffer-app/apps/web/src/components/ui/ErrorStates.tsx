'use client';

import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function ErrorCard({
  emoji, title, body, primaryLabel, primaryAction, secondaryLabel, secondaryAction,
}: {
  emoji: string;
  title: string;
  body: string;
  primaryLabel?: string;
  primaryAction?: () => void;
  secondaryLabel?: string;
  secondaryAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-5 px-6 py-10 max-w-sm mx-auto">
      <span className="text-5xl" aria-hidden="true">{emoji}</span>
      <div>
        <h2 className="text-white text-xl font-bold mb-2">{title}</h2>
        <p className="text-[#8B9CB6] text-sm leading-relaxed">{body}</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {primaryLabel && primaryAction && (
          <button
            type="button"
            onClick={primaryAction}
            className="w-full py-3 rounded-xl bg-[#00C9A7] text-[#0F1117] font-semibold text-sm hover:bg-[#00B496] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            {primaryLabel}
          </button>
        )}
        {secondaryLabel && secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction}
            className="w-full py-3 rounded-xl border border-[#2A3040] text-[#8B9CB6] text-sm hover:bg-[#1A1F2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 1. Session Expired ───────────────────────────────────────────────────────

export function SessionExpiredError() {
  const router = useRouter();
  return (
    <ErrorCard
      emoji="🔒"
      title="Session expired"
      body="For your security, we sign you out after 30 minutes of inactivity. Please sign in again."
      primaryLabel="Sign In"
      primaryAction={() => router.push('/login')}
    />
  );
}

// ─── 2. Network / Offline ─────────────────────────────────────────────────────

export function NetworkError({ onRetry }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="📡"
      title="No internet connection"
      body="Check your Wi-Fi or cellular connection and try again. Your data is safe."
      primaryLabel="Try Again"
      primaryAction={onRetry}
    />
  );
}

// ─── 3. Plaid Disconnected ────────────────────────────────────────────────────

export function PlaidDisconnectedError() {
  return (
    <ErrorCard
      emoji="🏦"
      title="Bank connection expired"
      body="Your Plaid connection needs to be refreshed. This happens periodically for security."
      primaryLabel="Reconnect Bank"
      primaryAction={() => { /* TODO: open Plaid Link */ }}
    />
  );
}

// ─── 4. Insufficient Funds ───────────────────────────────────────────────────

export function InsufficientFundsError({ onDismiss }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="💳"
      title="Payment declined"
      body="Your bank account didn't have enough funds for this transfer. Please ensure sufficient balance and try again."
      primaryLabel="Try Different Amount"
      primaryAction={onDismiss}
      secondaryLabel="Contact Support"
      secondaryAction={() => window.open('mailto:support@mybuffer.ca')}
    />
  );
}

// ─── 5. Payment Failed (general) ─────────────────────────────────────────────

export function PaymentFailedError({ onRetry, onDismiss }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="⚠️"
      title="Payment failed"
      body="We couldn't process your payment. This may be a temporary issue with your bank. If it continues, contact support."
      primaryLabel="Retry Payment"
      primaryAction={onRetry}
      secondaryLabel="Get Help"
      secondaryAction={() => window.open('mailto:support@mybuffer.ca')}
    />
  );
}

// ─── 6. KYC Pending ──────────────────────────────────────────────────────────

export function KycPendingError() {
  return (
    <ErrorCard
      emoji="⏳"
      title="Verification in progress"
      body="We're reviewing your identity documents. This usually takes less than 24 hours. You'll get an email when it's done."
      primaryLabel="Check Email"
      primaryAction={() => {}}
    />
  );
}

// ─── 7. Plaid Data Stale ─────────────────────────────────────────────────────

export function StaleDataError({ onRetry }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="🔄"
      title="Data out of date"
      body="Your financial data is over 24 hours old. Refresh to see your latest balances and transactions."
      primaryLabel="Refresh Now"
      primaryAction={onRetry}
    />
  );
}

// ─── 8. Rate Limit ───────────────────────────────────────────────────────────

export function RateLimitError({ onDismiss }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="⏱️"
      title="Too many requests"
      body="You've made too many requests in a short time. Please wait a moment and try again."
      primaryLabel="OK, got it"
      primaryAction={onDismiss}
    />
  );
}

// ─── 9. Province Not Supported ───────────────────────────────────────────────

export function ProvinceNotSupportedError() {
  return (
    <ErrorCard
      emoji="🗺️"
      title="Not available in your province yet"
      body="The Buffer Credit Line isn't available in your province yet, but Credit Builder is! You're already enrolled and building your score."
      primaryLabel="View Credit Builder"
      primaryAction={() => { /* route to credit tab */ }}
    />
  );
}

// ─── 10. Server Error (5xx) ───────────────────────────────────────────────────

export function ServerError({ onRetry }: ErrorStateProps) {
  return (
    <ErrorCard
      emoji="🛠️"
      title="Something went wrong on our end"
      body="Our team has been notified and is working on a fix. Please try again in a few minutes."
      primaryLabel="Try Again"
      primaryAction={onRetry}
      secondaryLabel="Check Status"
      secondaryAction={() => window.open('https://status.mybuffer.ca')}
    />
  );
}

// ─── 11. Feature Not Available ───────────────────────────────────────────────

export function FeatureUnavailableError({ feature }: { feature: string }) {
  return (
    <ErrorCard
      emoji="🔜"
      title={`${feature} coming soon`}
      body={`${feature} is being rolled out and isn't available for your account yet. We'll notify you when it's ready.`}
    />
  );
}

// ─── 12. Empty State ─────────────────────────────────────────────────────────

export function EmptyState({
  title, body, cta, ctaAction,
}: {
  title: string; body: string; cta?: string; ctaAction?: () => void;
}) {
  return (
    <ErrorCard
      emoji="📋"
      title={title}
      body={body}
      primaryLabel={cta}
      primaryAction={ctaAction}
    />
  );
}

// ─── Inline error banner (for form-level errors) ──────────────────────────────

export function ErrorBanner({
  message, onDismiss,
}: {
  message: string; onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-red-400 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-red-400/60 hover:text-red-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────

export function Toast({
  message, type = 'info', onDismiss,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss?: () => void;
}) {
  const colors = {
    success: 'bg-[#00C9A7] text-[#0F1117]',
    error:   'bg-red-500 text-white',
    info:    'bg-[#1A1F2E] text-white border border-[#2A3040]',
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 rounded-full px-5 py-2.5 shadow-xl text-sm font-medium',
        'animate-in fade-in slide-in-from-bottom-2',
        colors[type],
      ].join(' ')}
    >
      {message}
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="ml-1 opacity-70 hover:opacity-100" aria-label="Dismiss">×</button>
      )}
    </div>
  );
}
