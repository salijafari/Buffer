import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { fetchOnboardingProfile } from "@/app/lib/onboardingApi";
import { fetchPlaidConnectionStatus } from "@/lib/plaidApi";

export type DashboardConnectionMode = "pre" | "post";

/**
 * URL `?dashboardConnection=pre|post` overrides everything (QA).
 * If Plaid reports connected → post (linked accounts).
 * Otherwise default to **pre** so users see Plaid Link, not fake bank cards.
 * Set `VITE_DASHBOARD_CONNECTION=post` to force post UI without Plaid (design/demo only).
 */
export function resolveDashboardConnectionMode(
  searchParams: URLSearchParams,
  plaidConnected: boolean | null,
): DashboardConnectionMode {
  const q = searchParams.get("dashboardConnection");
  if (q === "pre" || q === "post") return q;
  if (plaidConnected === true) return "post";
  return modeFromEnv();
}

/** Default `pre` unless env explicitly forces post (demo). */
function modeFromEnv(): DashboardConnectionMode {
  const v = import.meta.env.VITE_DASHBOARD_CONNECTION;
  return v === "post" ? "post" : "pre";
}

type DashboardShellContextValue = {
  connectionMode: DashboardConnectionMode;
  /** True once Plaid Link exchange succeeded for this user (server). */
  plaidConnected: boolean | null;
  refreshPlaidConnection: () => Promise<void>;
  /** Reload onboarding profile from BFF (e.g. after Plaid exchange updates flags). */
  refreshProfile: () => Promise<void>;
  profile: UserOnboardingProfile | null;
  profileLoading: boolean;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const [plaidConnected, setPlaidConnected] = useState<boolean | null>(null);

  const refreshPlaidConnection = useCallback(async () => {
    try {
      const s = await fetchPlaidConnectionStatus();
      setPlaidConnected(Boolean(s.connected));
    } catch {
      setPlaidConnected(false);
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

  const connectionMode = useMemo(
    () => resolveDashboardConnectionMode(searchParams, plaidConnected),
    [searchParams, plaidConnected],
  );

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
      connectionMode,
      plaidConnected,
      refreshPlaidConnection,
      refreshProfile,
      profile,
      profileLoading,
    }),
    [connectionMode, plaidConnected, refreshPlaidConnection, refreshProfile, profile, profileLoading],
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
