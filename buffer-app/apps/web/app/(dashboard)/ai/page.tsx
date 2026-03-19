import type { Metadata } from 'next';
import { AiScreen } from '@/components/ai/AiScreen';

export const metadata: Metadata = { title: 'AI Assistant' };

export default function AiPage() {
  return <AiScreen />;
}
