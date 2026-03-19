'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Fields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type FieldErrors = Partial<Record<keyof Fields | 'form', string>>;

/** Entropy score 0–4 (like zxcvbn simplified) */
function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (pw.length < 6)  return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_LABEL = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const;
const STRENGTH_COLOR = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-400',
  'bg-[#00C9A7]',
  'bg-[#00C9A7]',
] as const;

function validate(fields: Fields): FieldErrors {
  const errs: FieldErrors = {};
  if (!fields.name.trim()) errs.name = 'Name is required';
  if (!fields.email)                                        errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Enter a valid email address';
  if (!fields.password)             errs.password = 'Password is required';
  else if (fields.password.length < 8) errs.password = 'Password must be at least 8 characters';
  else if (passwordStrength(fields.password) < 2) errs.password = 'Choose a stronger password';
  if (!fields.confirmPassword) errs.confirmPassword = 'Please confirm your password';
  else if (fields.confirmPassword !== fields.password) errs.confirmPassword = 'Passwords do not match';
  return errs;
}

export function SignUpScreen() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const allErrors = validate(fields);

  function set(key: keyof Fields, value: string) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function touch(key: keyof Fields) {
    setTouched(prev => ({ ...prev, [key]: true }));
  }

  const strength = passwordStrength(fields.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mark all touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(allErrors).length > 0) return;
    setFormError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          password: fields.password,
          confirmPassword: fields.confirmPassword,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(payload.error ?? 'Something went wrong. Please try again.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  function fieldClass(key: keyof Fields) {
    const hasErr = touched[key] && allErrors[key];
    return [
      'w-full bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 outline-none',
      'border transition-colors placeholder:text-[#3D4A5C]',
      'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
      hasErr ? 'border-red-500' : 'border-[#2A3040]',
    ].join(' ');
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#00C9A7] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M6 22C6 22 10 6 14 6C18 6 22 22 22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M9 16H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-white text-xl font-semibold tracking-tight">Buffer</span>
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-[#8B9CB6] text-sm mb-8">Start your journey to debt freedom</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {formError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {formError}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[#8B9CB6] text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={e => set('name', e.target.value)}
              onBlur={() => touch('name')}
              aria-invalid={!!(touched.name && allErrors.name)}
              aria-describedby={touched.name && allErrors.name ? 'name-err' : undefined}
              placeholder="Alex Chen"
              className={fieldClass('name')}
            />
            {touched.name && allErrors.name && (
              <p id="name-err" role="alert" className="text-red-400 text-xs">{allErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[#8B9CB6] text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={fields.email}
              onChange={e => set('email', e.target.value)}
              onBlur={() => touch('email')}
              aria-invalid={!!(touched.email && allErrors.email)}
              aria-describedby={touched.email && allErrors.email ? 'email-err' : undefined}
              placeholder="you@example.com"
              className={fieldClass('email')}
            />
            {touched.email && allErrors.email && (
              <p id="email-err" role="alert" className="text-red-400 text-xs">{allErrors.email}</p>
            )}
          </div>

          {/* Password + confirm */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[#8B9CB6] text-sm font-medium">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={fields.password}
                onChange={e => set('password', e.target.value)}
                onBlur={() => touch('password')}
                aria-invalid={!!(touched.password && allErrors.password)}
                aria-describedby="pw-strength"
                placeholder="Min. 8 characters"
                className={[fieldClass('password'), 'pr-11'].join(' ')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8B9CB6] transition-colors"
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Strength meter */}
            {fields.password.length > 0 && (
              <div id="pw-strength" className="flex flex-col gap-1.5 mt-0.5">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={[
                        'flex-1 h-1 rounded-full transition-colors duration-300',
                        i < strength ? STRENGTH_COLOR[strength] : 'bg-[#2A3040]',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#8B9CB6]">{STRENGTH_LABEL[strength]}</p>
              </div>
            )}

            {touched.password && allErrors.password && (
              <p role="alert" className="text-red-400 text-xs">{allErrors.password}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-[#8B9CB6] text-sm font-medium">Confirm password</label>
            <input
              id="confirmPassword"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={fields.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              onBlur={() => touch('confirmPassword')}
              aria-invalid={!!(touched.confirmPassword && allErrors.confirmPassword)}
              aria-describedby={touched.confirmPassword && allErrors.confirmPassword ? 'cp-err' : undefined}
              placeholder="Re-enter your password"
              className={fieldClass('confirmPassword')}
            />
            {touched.confirmPassword && allErrors.confirmPassword && (
              <p id="cp-err" role="alert" className="text-red-400 text-xs">{allErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-[#4A5568] text-xs leading-relaxed">
            By creating an account you agree to Buffer&apos;s{' '}
            <a href="/terms" className="text-[#00C9A7] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-[#00C9A7] hover:underline">Privacy Policy</a>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 hover:bg-[#00B496] active:bg-[#00A085] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon />
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[#4A5568] text-sm mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00C9A7] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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
