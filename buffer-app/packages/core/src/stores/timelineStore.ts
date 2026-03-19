import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TimelineOutput } from '../debtFreeTimeline.js';

interface TimelineState {
  timeline:           TimelineOutput | null;
  enrollmentSnapshot: {
    cardBalances:        number[];
    cardAPRs:            number[];
    future1BalanceArray: number[];
    enrolledAt:          string;
  } | null;
  adjustedPayment:    number | null;
  isLoading:          boolean;
  setTimeline:        (t: TimelineOutput) => void;
  setEnrollmentSnapshot:(s: TimelineState['enrollmentSnapshot']) => void;
  setAdjustedPayment: (amount: number) => void;
  setLoading:         (loading: boolean) => void;
}

export const useTimelineStore = create<TimelineState>()(
  immer((set) => ({
    timeline:           null,
    enrollmentSnapshot: null,
    adjustedPayment:    null,
    isLoading:          false,

    setTimeline:           (t) => set((s) => { s.timeline = t; }),
    setEnrollmentSnapshot: (snap) => set((s) => { s.enrollmentSnapshot = snap; }),
    setAdjustedPayment:    (amt) => set((s) => { s.adjustedPayment = amt; }),
    setLoading:            (loading) => set((s) => { s.isLoading = loading; }),
  })),
);
