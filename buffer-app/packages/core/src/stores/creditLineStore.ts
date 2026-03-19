import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { BufferCreditLine } from '@buffer/api';

interface CreditLineState {
  creditLine:   BufferCreditLine | null;
  lastUpdated:  number | null;
  isLoading:    boolean;
  error:        string | null;
  setCreditLine:(line: BufferCreditLine) => void;
  setLoading:   (loading: boolean) => void;
  setError:     (err: string | null) => void;
  markUpdated:  () => void;
  isStale:      (maxAgeMs: number) => boolean;
  /** Optimistic update on transfer — roll back on API error */
  optimisticDebit:(amount: number) => void;
  rollbackDebit:  (amount: number) => void;
}

export const useCreditLineStore = create<CreditLineState>()(
  immer((set, get) => ({
    creditLine:  null,
    lastUpdated: null,
    isLoading:   false,
    error:       null,

    setCreditLine: (line) => set((s) => { s.creditLine = line; s.lastUpdated = Date.now(); }),
    setLoading:    (loading) => set((s) => { s.isLoading = loading; }),
    setError:      (err)    => set((s) => { s.error = err; }),
    markUpdated:   ()       => set((s) => { s.lastUpdated = Date.now(); }),

    isStale: (maxAgeMs) => {
      const { lastUpdated } = get();
      if (lastUpdated == null) return true;
      return Date.now() - lastUpdated > maxAgeMs;
    },

    optimisticDebit: (amount) => set((s) => {
      if (!s.creditLine) return;
      s.creditLine.currentBalance  += amount;
      s.creditLine.availableCredit -= amount;
      s.creditLine.utilization      = s.creditLine.currentBalance / s.creditLine.creditLimit;
    }),

    rollbackDebit: (amount) => set((s) => {
      if (!s.creditLine) return;
      s.creditLine.currentBalance  -= amount;
      s.creditLine.availableCredit += amount;
      s.creditLine.utilization      = s.creditLine.currentBalance / s.creditLine.creditLimit;
    }),
  })),
);
