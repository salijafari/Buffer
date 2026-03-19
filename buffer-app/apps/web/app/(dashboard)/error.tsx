'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Dashboard] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="max-w-sm text-sm text-gray-400">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#00C9A7] px-6 py-2 text-sm font-medium text-black hover:bg-[#00b396] active:scale-95 transition-transform"
      >
        Try again
      </button>
    </div>
  );
}
