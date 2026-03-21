import { useEffect, useMemo, useState } from "react";
import { fetchOnboardingProfile } from "@/app/lib/onboardingApi";
import type { UserOnboardingProfile } from "@/app/lib/onboardingProfile";
import { useBffAuth } from "@/lib/BffAuthContext";

export type AccountIdentity = {
  firstName: string;
  lastName: string;
  email: string;
  /** Full name for header */
  displayName: string;
  picture: string | null;
  initials: string;
};

function buildIdentity(profile: UserOnboardingProfile | null, bff: { name: string | null; email: string | null; picture: string | null } | null): AccountIdentity {
  const parts = (bff?.name ?? "").trim().split(/\s+/);
  const fnFromName = parts[0] ?? "";
  const lnFromName = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const firstName = (profile?.first_name ?? fnFromName).trim();
  const lastName = (profile?.last_name ?? lnFromName).trim();
  const email = (profile?.email ?? bff?.email ?? "").trim();
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || bff?.name?.trim() || email || "Account";

  let initials = "?";
  if (firstName && lastName) {
    initials = `${firstName[0]!}${lastName[0]!}`.toUpperCase();
  } else if (firstName.length >= 2) {
    initials = firstName.slice(0, 2).toUpperCase();
  } else if (firstName.length === 1) {
    initials = firstName[0]!.toUpperCase();
  } else if (email.length > 0) {
    initials = email[0]!.toUpperCase();
  }

  return {
    firstName,
    lastName,
    email,
    displayName,
    picture: bff?.picture ?? null,
    initials,
  };
}

/**
 * Merges DB onboarding profile (first/last/email from Auth0 userinfo on sync) with BFF `/api/auth/me` (ID token claims).
 */
export function useAccountIdentity(): {
  identity: AccountIdentity;
  loading: boolean;
  profileError: boolean;
} {
  const { state } = useBffAuth();
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const userId = state.status === "auth" ? state.user.sub : null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setProfile(null);
      setProfileError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setProfileError(false);
    fetchOnboardingProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfileError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const identity = useMemo(() => {
    const bff = state.status === "auth" ? state.user : null;
    return buildIdentity(profile, bff);
  }, [profile, state]);

  return { identity, loading, profileError };
}
