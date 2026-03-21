import { fetchOnboardingProfile, postSyncUser } from "./onboardingApi";
import type { UserOnboardingProfile } from "./onboardingProfile";

export const ONBOARDING_GATE_TIMEOUT_MS = 15_000;

export type OnboardingBootstrapResult = {
  onboarding_completed: boolean;
  profile: UserOnboardingProfile | null;
};

/**
 * Single pipeline: sync user (Auth0 `sub` via BFF session) to DB, then load profile when onboarding is not yet completed.
 * DB-only. Uses cookie session + CSRF on mutating calls. Caller should pass an AbortSignal with a timeout (see gate in main.tsx).
 */
export async function bootstrapOnboardingFromDb(signal: AbortSignal): Promise<OnboardingBootstrapResult> {
  if (signal.aborted) {
    return { onboarding_completed: false, profile: null };
  }

  const sync = await postSyncUser(signal);
  if (sync.onboarding_completed) {
    return { onboarding_completed: true, profile: null };
  }

  const profile = await fetchOnboardingProfile(signal);
  if (profile?.onboarding_completed === true) {
    return { onboarding_completed: true, profile };
  }
  return { onboarding_completed: false, profile };
}
