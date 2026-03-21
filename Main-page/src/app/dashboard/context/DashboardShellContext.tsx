import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { fetchOnboardingProfile } from "@/app/lib/onboardingApi";

export type DashboardConnectionMode = "pre" | "post";

function modeFromEnv(): DashboardConnectionMode {
  const v = import.meta.env.VITE_DASHBOARD_CONNECTION;
  return v === "pre" ? "pre" : "post";
}

export function resolveDashboardConnectionMode(searchParams: URLSearchParams): DashboardConnectionMode {
  const q = searchParams.get("dashboardConnection");
  if (q === "pre" || q === "post") return q;
  return modeFromEnv();
}

type DashboardShellContextValue = {
  connectionMode: DashboardConnectionMode;
  profile: UserOnboardingProfile | null;
  profileLoading: boolean;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const connectionMode = useMemo(() => resolveDashboardConnectionMode(searchParams), [searchParams]);

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
      profile,
      profileLoading,
    }),
    [connectionMode, profile, profileLoading],
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
