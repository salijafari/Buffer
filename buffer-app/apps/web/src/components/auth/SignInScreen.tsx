'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FieldError = { email?: string; password?: string; form?: string };

export function SignInScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<FieldError>({});
  const [loading, setLoading]   = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function validateEmail(v: string) {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  }

  function validatePassword(v: string) {
    if (!v) return 'Password is required';
    return '';
  }

  function handleEmailBlur() {
    const err = validateEmail(email);
    setErrors(prev => ({ ...prev, email: err || undefined }));
  }

  function handlePasswordBlur() {
    const err = validatePassword(password);
    setErrors(prev => ({ ...prev, password: err || undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const pwErr    = validatePassword(password);
    if (emailErr || pwErr) {
      setErrors({ email: emailErr || undefined, password: pwErr || undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: payload.error ?? 'Invalid email or password. Please try again.' });
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password. Please try again.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4">
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

      {/* Card */}
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-[#8B9CB6] text-sm mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Form-level error */}
          {errors.form && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {errors.form}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[#8B9CB6] text-sm font-medium">Email</label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              placeholder="you@example.com"
              className={[
                'bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 outline-none',
                'border transition-colors placeholder:text-[#3D4A5C]',
                'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
                errors.email ? 'border-red-500' : 'border-[#2A3040]',
              ].join(' ')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[#8B9CB6] text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-[#00C9A7] text-xs hover:underline focus-visible:outline-none focus-visible:underline"
              >
                Need an account?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                placeholder="••••••••"
                className={[
                  'w-full bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 pr-11 outline-none',
                  'border transition-colors placeholder:text-[#3D4A5C]',
                  'focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20',
                  errors.password ? 'border-red-500' : 'border-[#2A3040]',
                ].join(' ')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8B9CB6] transition-colors"
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl py-3.5 hover:bg-[#00B496] active:bg-[#00A085] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerIcon />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Sign-up link */}
        <p className="text-center text-[#4A5568] text-sm mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#00C9A7] hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="23.562" />
    </svg>
  );
}

