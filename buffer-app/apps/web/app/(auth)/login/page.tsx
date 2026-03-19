import type { Metadata } from 'next';
import { SignInScreen } from '@/components/auth/SignInScreen';

export const metadata: Metadata = {
  title:  'Sign In',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <SignInScreen />;
}
