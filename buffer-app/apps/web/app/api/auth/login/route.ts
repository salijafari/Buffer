import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import bcrypt from 'bcryptjs';
import { createSessionTokenForUser, setSessionCookie } from '@/lib/clerkSession';

type LoginBody = {
  email?: string;
  password?: string;
};

function unauthorized(error: string) {
  return NextResponse.json({ error }, { status: 401 });
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });
    const user = users.data[0];
    if (!user) return unauthorized('Invalid email or password');

    const passwordHash = (user.unsafeMetadata as { passwordHash?: string } | undefined)?.passwordHash;
    if (!passwordHash) return unauthorized('This account must reset password');

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) return unauthorized('Invalid email or password');

    const token = await createSessionTokenForUser(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
