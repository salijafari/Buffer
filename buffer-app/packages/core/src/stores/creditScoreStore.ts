import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CreditScore } from '@buffer/api';

interface CreditScoreState {
  score:       CreditScore | null;
  lastUpdated: number | null;
  isLoading:   boolean;
  setScore:    (s: CreditScore) => void;
  setLoading:  (loading: boolean) => void;
  isStale:     (maxAgeMs: number) => boolean;
}

export const useCreditScoreStore = create<CreditScoreState>()(
  immer((set, get) => ({
    score:       null,
    lastUpdated: null,
    isLoading:   false,
    setScore:    (score) => set((s) => { s.score = score; s.lastUpdated = Date.now(); }),
    setLoading:  (loading) => set((s) => { s.isLoading = loading; }),
    isStale:     (maxAgeMs) => {
      const { lastUpdated } = get();
      if (lastUpdated == null) return true;
      return Date.now() - lastUpdated > maxAgeMs;
    },
  })),
);
