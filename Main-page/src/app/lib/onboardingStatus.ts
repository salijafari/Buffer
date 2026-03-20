import { fetchOnboardingProfile, postSyncUser } from "./onboardingApi";
import type { UserOnboardingProfile } from "./onboardingProfile";

export const ONBOARDING_GATE_TIMEOUT_MS = 15_000;

export type OnboardingBootstrapResult = {
  onboarding_completed: boolean;
  profile: UserOnboardingProfile | null;
};

/**
 * Clerk's `getToken()` does not accept `AbortSignal`. If it never settles (stuck session, dev quirks),
 * bootstrap would hang forever while the gate timeout only aborts `fetch()` — not `getToken()`.
 * Racing with `signal` ensures we always leave loading after the gate's timeout.
 */
function getTokenWithAbortSignal(
  getToken: () => Promise<string | null>,
  signal: AbortSignal,
): Promise<string | null> {
  if (signal.aborted) {
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => resolve(null);
    signal.addEventListener("abort", onAbort, { once: true });
    getToken()
      .then((t) => {
        signal.removeEventListener("abort", onAbort);
        resolve(t);
      })
      .catch((e) => {
        signal.removeEventListener("abort", onAbort);
        reject(e);
      });
  });
}

/**
 * Single pipeline: sync Clerk user to DB, then load profile when onboarding is not yet completed.
 * DB-only — no Clerk metadata. Caller should pass an AbortSignal with a timeout (see gate in main.tsx).
 */
export async function bootstrapOnboardingFromDb(
  getToken: () => Promise<string | null>,
  signal: AbortSignal,
): Promise<OnboardingBootstrapResult> {
  const token = await getTokenWithAbortSignal(getToken, signal);
  if (!token) {
    return { onboarding_completed: false, profile: null };
  }

  const sync = await postSyncUser(token, signal);
  if (sync.onboarding_completed) {
    return { onboarding_completed: true, profile: null };
  }

  const profile = await fetchOnboardingProfile(token, signal);
  if (profile?.onboarding_completed === true) {
    return { onboarding_completed: true, profile };
  }
  return { onboarding_completed: false, profile };
}
