import type { Metadata } from 'next';
import { PayoffScreen } from '@/components/payoff/PayoffScreen';

export const metadata: Metadata = { title: 'Payoff' };

export default function PayoffPage() {
  return <PayoffScreen />;
}
