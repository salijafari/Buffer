import type { Metadata } from 'next';
import { SignUpScreen } from '@/components/auth/SignUpScreen';

export const metadata: Metadata = {
  title:  'Create Account',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpScreen />;
}
