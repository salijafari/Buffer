import type { AcquisitionSource, InterestSelection, UserOnboardingProfile } from "./onboardingProfile";
import { bffAuthHeadersForMutation } from "@/lib/bffSession";

/** Step saves only — completion is POST /api/onboarding/complete */
export type OnboardingProfilePatch = {
  onboarding_step: number;
  interest_selection: InterestSelection | null;
  interest_custom_text: string;
  province_code: string;
  province_name: string;
  credit_score: number | null;
  annual_pre_tax_income: number | null;
  heard_about_us: AcquisitionSource | null;
  heard_about_us_other: string;
};

const REQUEST_TIMEOUT_MS = 12_000;

function linkAbortSignals(controller: AbortController, outer?: AbortSignal): () => void {
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onOuterAbort = () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
  if (outer) {
    if (outer.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      outer.addEventListener("abort", onOuterAbort, { once: true });
    }
  }
  return () => {
    clearTimeout(timeoutId);
    if (outer) outer.removeEventListener("abort", onOuterAbort);
  };
}

export async function fetchOnboardingProfile(signal?: AbortSignal): Promise<UserOnboardingProfile | null> {
  const controller = new AbortController();
  const cleanup = linkAbortSignals(controller, signal);
  try {
    const response = await fetch("/api/onboarding-profile", {
      signal: controller.signal,
      credentials: "include",
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    const data = (await response.json()) as { profile: UserOnboardingProfile | null };
    return data.profile;
  } finally {
    cleanup();
  }
}

/** GET — no CSRF (see server); session cookie only. */
export async function fetchSyncUser(signal?: AbortSignal): Promise<{ userId: string; onboarding_completed: boolean }> {
  const controller = new AbortController();
  const cleanup = linkAbortSignals(controller, signal);
  try {
    const response = await fetch("/api/auth/sync-user", {
      method: "GET",
      signal: controller.signal,
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`sync-user failed (${response.status}): ${errBody.slice(0, 200)}`);
    }
    return response.json() as Promise<{ userId: string; onboarding_completed: boolean }>;
  } finally {
    cleanup();
  }
}

export async function postOnboardingComplete(signal?: AbortSignal): Promise<{ success: boolean; message: string }> {
  const controller = new AbortController();
  const cleanup = linkAbortSignals(controller, signal);
  try {
    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
      signal: controller.signal,
      credentials: "include",
      headers: bffAuthHeadersForMutation(),
    });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return response.json() as Promise<{ success: boolean; message: string }>;
  } finally {
    cleanup();
  }
}

export async function saveOnboardingProfile(payload: OnboardingProfilePatch): Promise<UserOnboardingProfile> {
  const controller = new AbortController();
  const cleanup = linkAbortSignals(controller);
  try {
    const response = await fetch("/api/onboarding-profile", {
      method: "PUT",
      signal: controller.signal,
      credentials: "include",
      headers: bffAuthHeadersForMutation(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    const data = (await response.json()) as { profile: UserOnboardingProfile };
    return data.profile;
  } finally {
    cleanup();
  }
}
