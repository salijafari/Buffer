import type { Metadata } from 'next';
import { CreditScreen } from '@/components/credit/CreditScreen';

export const metadata: Metadata = { title: 'Credit' };

export default function CreditPage() {
  return <CreditScreen />;
}
