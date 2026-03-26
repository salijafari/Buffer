/**
 * Browser helpers for Auth0 BFF: session is HTTP-only; CSRF cookie is readable for double-submit.
 */

const BFF_ME_TIMEOUT_MS = 12_000;

/** Empty string = same origin (dev: Vite proxies `/api` → BFF). Set when the SPA and API differ. */
export function getBffApiBase(): string {
  const raw = import.meta.env.VITE_BFF_ORIGIN;
  if (typeof raw === "string" && raw.trim()) {
    return raw.replace(/\/+$/, "");
  }
  return "";
}

export function bffApiUrl(path: string): string {
  const base = getBffApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

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

export async function fetchBffMe(externalSignal?: AbortSignal): Promise<BffMeResult> {
  const url = bffApiUrl("/api/auth/me");
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), BFF_ME_TIMEOUT_MS);
  const onExternalAbort = () => {
    clearTimeout(timeoutId);
    ctrl.abort();
  };
  if (externalSignal?.aborted) {
    clearTimeout(timeoutId);
    return { authenticated: false };
  }
  if (externalSignal) {
    externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }
  let res: Response;
  try {
    res = await fetch(url, { credentials: "include", signal: ctrl.signal });
    clearTimeout(timeoutId);
  } catch {
    clearTimeout(timeoutId);
    if (externalSignal) externalSignal.removeEventListener("abort", onExternalAbort);
    return { authenticated: false };
  }
  if (externalSignal) externalSignal.removeEventListener("abort", onExternalAbort);

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
  return bffApiUrl(`/api/auth/login${q ? `?${q}` : ""}`);
}

/**
 * Clears BFF session; server may return Auth0 federated logout URL.
 * Optional `returnTo` is only used if the server has no AUTH0_LOGOUT_RETURN_URL / callback origin.
 * Prefer setting AUTH0_LOGOUT_RETURN_URL on the API (canonical URL for Auth0 Allowed Logout URLs).
 */
/**
 * Removes profile row from DB, deletes Auth0 user (Management API), clears session. Requires CSRF cookie + header.
 * @see docs/BFF_AUTH.md — Auth0 Management API (delete:users) must be configured.
 */
export async function deleteBffAccount(): Promise<
  { ok: true; redirect: string } | { ok: false; error: string; hint?: string }
> {
  const res = await fetch(bffApiUrl("/api/account/delete"), {
    method: "POST",
    credentials: "include",
    headers: bffAuthHeadersForMutation(),
  });
  let data: { ok?: boolean; redirect?: string; error?: string; hint?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* ignore */
  }
  if (res.ok && data.ok) {
    return { ok: true, redirect: typeof data.redirect === "string" ? data.redirect : "/" };
  }
  return {
    ok: false,
    error: data.error ?? `Request failed (${res.status})`,
    hint: typeof data.hint === "string" ? data.hint : undefined,
  };
}

export async function bffLogout(returnTo?: string | null): Promise<void> {
  const csrf = getBffCsrfTokenFromDocument();
  const res = await fetch(bffApiUrl("/api/auth/logout"), {
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
