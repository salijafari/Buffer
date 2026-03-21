import { fetchOnboardingProfile, fetchSyncUser } from "./onboardingApi";
import type { UserOnboardingProfile } from "./onboardingProfile";

export const ONBOARDING_GATE_TIMEOUT_MS = 15_000;

export type OnboardingBootstrapResult = {
  onboarding_completed: boolean;
  profile: UserOnboardingProfile | null;
  /** Set when sync or profile fetch throws (e.g. 401, 500, network). */
  error?: string;
};

/**
 * Single pipeline: sync user (Auth0 `sub` via BFF session) to DB, then load profile when onboarding is not yet completed.
 * DB-only. Sync uses GET + cookie; CSRF on POST/PUT onboarding routes.
 */
export async function bootstrapOnboardingFromDb(signal: AbortSignal): Promise<OnboardingBootstrapResult> {
  if (signal.aborted) {
    return { onboarding_completed: false, profile: null, error: "Request cancelled or timed out." };
  }

  try {
    const sync = await fetchSyncUser(signal);
    if (sync.onboarding_completed) {
      return { onboarding_completed: true, profile: null };
    }

    const profile = await fetchOnboardingProfile(signal);
    if (profile?.onboarding_completed === true) {
      return { onboarding_completed: true, profile };
    }
    return { onboarding_completed: false, profile };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { onboarding_completed: false, profile: null, error: msg };
  }
}
