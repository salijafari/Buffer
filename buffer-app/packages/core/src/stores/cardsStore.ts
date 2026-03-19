import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CreditCard, Transaction } from '@buffer/api';

interface CardsState {
  cards:        CreditCard[];
  transactions: Transaction[];
  lastUpdated:  number | null;
  isLoading:    boolean;
  error:        string | null;
  setCards:     (cards: CreditCard[]) => void;
  setTransactions:(txns: Transaction[]) => void;
  setLoading:   (loading: boolean) => void;
  setError:     (err: string | null) => void;
  markUpdated:  () => void;
  isStale:      (maxAgeMs: number) => boolean;
}

export const useCardsStore = create<CardsState>()(
  immer((set, get) => ({
    cards:        [],
    transactions: [],
    lastUpdated:  null,
    isLoading:    false,
    error:        null,

    setCards:       (cards) => set((s) => { s.cards = cards; }),
    setTransactions:(txns)  => set((s) => { s.transactions = txns; }),
    setLoading:     (loading) => set((s) => { s.isLoading = loading; }),
    setError:       (err)   => set((s) => { s.error = err; }),
    markUpdated:    ()      => set((s) => { s.lastUpdated = Date.now(); }),
    isStale:        (maxAgeMs) => {
      const { lastUpdated } = get();
      if (lastUpdated == null) return true;
      return Date.now() - lastUpdated > maxAgeMs;
    },
  })),
);
