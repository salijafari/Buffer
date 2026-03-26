import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { fetchOnboardingProfile } from "@/app/lib/onboardingApi";
import { fetchPlaidConnectionStatus } from "@/lib/plaidApi";

type DashboardShellContextValue = {
  /** True when server reports active Plaid items. Null until first status fetch completes. */
  plaidConnected: boolean | null;
  /** Raw status from `/api/plaid/connection-status` (e.g. connected, disconnected). */
  plaidStatus: string | null;
  refreshPlaidConnection: () => Promise<void>;
  /** Reload onboarding profile from BFF (e.g. after Plaid exchange updates flags). */
  refreshProfile: () => Promise<void>;
  profile: UserOnboardingProfile | null;
  profileLoading: boolean;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [plaidConn, setPlaidConn] = useState<{ connected: boolean; status: string } | null>(null);

  const plaidConnected = plaidConn === null ? null : plaidConn.connected;
  const plaidStatus = plaidConn?.status ?? null;

  const refreshPlaidConnection = useCallback(async () => {
    try {
      const s = await fetchPlaidConnectionStatus();
      setPlaidConn({ connected: Boolean(s.connected), status: s.status });
    } catch {
      setPlaidConn({ connected: false, status: "disconnected" });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      setProfile(await fetchOnboardingProfile());
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    void refreshPlaidConnection();
  }, [refreshPlaidConnection]);

  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    void fetchOnboardingProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      plaidConnected,
      plaidStatus,
      refreshPlaidConnection,
      refreshProfile,
      profile,
      profileLoading,
    }),
    [plaidConnected, plaidStatus, refreshPlaidConnection, refreshProfile, profile, profileLoading],
  );

  return <DashboardShellContext.Provider value={value}>{children}</DashboardShellContext.Provider>;
}

export function useDashboardShell(): DashboardShellContextValue {
  const ctx = useContext(DashboardShellContext);
  if (!ctx) {
    throw new Error("useDashboardShell must be used within DashboardShellProvider");
  }
  return ctx;
}

/** Safe variant when provider missing (e.g. tests). */
export function useDashboardShellOptional(): DashboardShellContextValue | null {
  return useContext(DashboardShellContext);
}
