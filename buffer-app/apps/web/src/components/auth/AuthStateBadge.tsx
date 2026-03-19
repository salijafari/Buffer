'use client';

import { useEffect, useState } from 'react';

type SessionState = {
  signedIn: boolean;
  userId: string | null;
};

export function AuthStateBadge() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) throw new Error('Unable to load auth state');
        const data = (await res.json()) as SessionState;
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load auth state';
          setError(message);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>;
  }

  if (!session) {
    return <p className="text-xs text-[#8B9CB6]">Checking authentication state…</p>;
  }

  if (!session.signedIn) {
    return <p className="text-xs text-[#8B9CB6]">Not signed in</p>;
  }

  return (
    <p className="text-xs text-[#00C9A7]">
      Signed in as <span className="font-mono">{session.userId}</span>
    </p>
  );
}
