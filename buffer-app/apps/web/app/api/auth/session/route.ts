import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  return NextResponse.json({
    signedIn: Boolean(auth.userId),
    userId: auth.userId ?? null,
    sessionId: auth.sessionId ?? null,
  });
}
