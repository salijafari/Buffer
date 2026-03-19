import { cookies } from 'next/headers';

const CLERK_API_BASE = 'https://api.clerk.com/v1';
const SESSION_COOKIE = '__session';

function getSecretKey(): string {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    throw new Error('CLERK_SECRET_KEY is missing');
  }
  return key;
}

async function clerkApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CLERK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let errorMessage = 'Clerk API request failed';
    const payload = await res.json().catch(() => null);
    if (payload && typeof payload === 'object' && 'errors' in payload) {
      const first = Array.isArray((payload as { errors?: unknown[] }).errors)
        ? (payload as { errors: Array<{ message?: string }> }).errors[0]
        : undefined;
      if (first?.message) errorMessage = first.message;
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export async function createSessionTokenForUser(userId: string): Promise<string> {
  const session = await clerkApi<{ id: string }>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });

  const token = await clerkApi<{ jwt: string }>(`/sessions/${session.id}/tokens`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return token.jwt;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
