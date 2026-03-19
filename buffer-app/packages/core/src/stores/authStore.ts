import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { User } from '@buffer/api';

interface AuthState {
  user:           User | null;
  isAuthenticated:boolean;
  isLoading:      boolean;
  sessionExpired: boolean;
  setUser:        (user: User | null) => void;
  setLoading:     (loading: boolean) => void;
  setSessionExpired:(expired: boolean) => void;
  clearAuth:      () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user:            null,
    isAuthenticated: false,
    isLoading:       true,
    sessionExpired:  false,

    setUser: (user) => set((s) => {
      s.user            = user;
      s.isAuthenticated = user != null;
      s.isLoading       = false;
      s.sessionExpired  = false;
    }),

    setLoading: (loading) => set((s) => { s.isLoading = loading; }),

    setSessionExpired: (expired) => set((s) => {
      s.sessionExpired  = expired;
      if (expired) {
        s.isAuthenticated = false;
      }
    }),

    clearAuth: () => set((s) => {
      s.user            = null;
      s.isAuthenticated = false;
      s.isLoading       = false;
      s.sessionExpired  = false;
    }),
  })),
);
