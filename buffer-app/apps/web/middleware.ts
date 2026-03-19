import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/payoff(.*)',
  '/ai(.*)',
  '/credit(.*)',
  '/account(.*)',
  '/onboarding(.*)',
]);

const isAuthRoute = createRouteMatcher(['/login(.*)', '/signup(.*)', '/auth(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  if (!userId && isProtectedRoute(request)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
