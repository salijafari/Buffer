import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthStateBadge } from '@/components/auth/AuthStateBadge';

export const metadata: Metadata = {
  title: 'Authentication',
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A3040] bg-[#1A1F2E] p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">Welcome to Buffer</h1>
        <p className="mt-2 text-sm text-[#8B9CB6]">
          Sign in or create an account with our inline forms. No popups, no external redirects.
        </p>

        <div className="mt-4">
          <AuthStateBadge />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-xl bg-[#00C9A7] px-4 py-3 text-center text-sm font-semibold text-[#0F1117] hover:bg-[#00B496]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-[#2A3040] px-4 py-3 text-center text-sm font-semibold text-[#E2E8F0] hover:bg-[#22293A]"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
