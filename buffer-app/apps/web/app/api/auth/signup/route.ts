import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import bcrypt from 'bcryptjs';
import { createSessionTokenForUser, setSessionCookie } from '@/lib/clerkSession';

type SignUpBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  let body: SignUpBody;
  try {
    body = (await request.json()) as SignUpBody;
  } catch {
    return badRequest('Invalid JSON payload');
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  const confirmPassword = body.confirmPassword ?? '';

  if (!name) return badRequest('Name is required');
  if (!email) return badRequest('Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest('Enter a valid email address');
  if (password.length < 8) return badRequest('Password must be at least 8 characters');
  if (password !== confirmPassword) return badRequest('Passwords do not match');

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [firstName, ...rest] = name.split(/\s+/);
    const lastName = rest.join(' ') || undefined;

    const client = await clerkClient();
    const user = await client.users.createUser({
      firstName,
      lastName,
      emailAddress: [email],
      password,
      unsafeMetadata: { passwordHash },
    });

    const token = await createSessionTokenForUser(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account';
    if (message.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
