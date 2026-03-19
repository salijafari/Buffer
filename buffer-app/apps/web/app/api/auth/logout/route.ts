import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { clearSessionCookie } from '@/lib/clerkSession';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (auth.sessionId) {
      const client = await clerkClient();
      await client.sessions.revokeSession(auth.sessionId);
    }
  } catch {
    // If revoke fails, still clear the local cookie.
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
