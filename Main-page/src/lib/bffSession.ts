/**
 * Browser helpers for Auth0 BFF: session is HTTP-only; CSRF cookie is readable for double-submit.
 */

export type BffUser = {
  sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export type BffMeResult = { authenticated: true; user: BffUser } | { authenticated: false };

export function getBffCsrfTokenFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((row) => row.startsWith("bff_csrf="));
  if (!raw) return null;
  return decodeURIComponent(raw.slice("bff_csrf=".length));
}

export function bffAuthHeadersForMutation(): Record<string, string> {
  const csrf = getBffCsrfTokenFromDocument();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrf) headers["X-CSRF-Token"] = csrf;
  return headers;
}

export async function fetchBffMe(signal?: AbortSignal): Promise<BffMeResult> {
  const res = await fetch("/api/auth/me", { credentials: "include", signal });
  let data: {
    authenticated?: boolean;
    sub?: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* ignore */
  }
  if (res.ok && data.authenticated && data.sub) {
    return {
      authenticated: true,
      user: {
        sub: data.sub,
        email: data.email ?? null,
        name: data.name ?? null,
        picture: data.picture ?? null,
      },
    };
  }
  return { authenticated: false };
}

export function bffLoginUrl(options?: { returnTo?: string; screenHint?: "signup" }): string {
  const params = new URLSearchParams();
  if (options?.returnTo) params.set("returnTo", options.returnTo);
  if (options?.screenHint) params.set("screen_hint", options.screenHint);
  const q = params.toString();
  return `/api/auth/login${q ? `?${q}` : ""}`;
}

/**
 * Clears BFF session; server may return Auth0 federated logout URL.
 * Optional `returnTo` is only used if the server has no AUTH0_LOGOUT_RETURN_URL / callback origin.
 * Prefer setting AUTH0_LOGOUT_RETURN_URL on the API (canonical URL for Auth0 Allowed Logout URLs).
 */
export async function bffLogout(returnTo?: string | null): Promise<void> {
  const csrf = getBffCsrfTokenFromDocument();
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      returnTo: returnTo ?? null,
    }),
  });
  let data: { federatedLogoutUrl?: string | null } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* ignore */
  }
  if (typeof window === "undefined") return;
  if (data.federatedLogoutUrl) {
    window.location.href = data.federatedLogoutUrl;
    return;
  }
  window.location.href = "/";
}
