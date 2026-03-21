/**
 * Auth0 Management API — delete user (requires M2M app with delete:users on Auth0 Management API).
 * @see https://auth0.com/docs/api/management/v2/users/delete-users-by-id
 *
 * Host for `/oauth/token` + `/api/v2/*`: **`AUTH0_MGMT_DOMAIN`** if set (canonical `*.auth0.com` tenant),
 * else **`AUTH0_DOMAIN`** (e.g. custom domain for login). Audience is always `https://<that host>/api/v2/`.
 */

function normalizeAuth0Host(raw) {
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getManagementDomain() {
  const raw = process.env.AUTH0_MGMT_DOMAIN?.trim() || process.env.AUTH0_DOMAIN?.trim();
  if (!raw) return { ok: false, error: "AUTH0_MGMT_DOMAIN or AUTH0_DOMAIN" };
  return { ok: true, domain: normalizeAuth0Host(raw) };
}

export function getAuth0ManagementConfig() {
  const d = getManagementDomain();
  if (!d.ok) return d;
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID?.trim() || process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET?.trim() || process.env.AUTH0_CLIENT_SECRET?.trim();
  if (!clientId) return { ok: false, error: "AUTH0_MGMT_CLIENT_ID or AUTH0_CLIENT_ID" };
  if (!clientSecret) return { ok: false, error: "AUTH0_MGMT_CLIENT_SECRET or AUTH0_CLIENT_SECRET" };
  return {
    ok: true,
    domain: d.domain,
    clientId,
    clientSecret,
    audience: `https://${d.domain}/api/v2/`,
  };
}

async function fetchManagementApiToken() {
  const c = getAuth0ManagementConfig();
  if (!c.ok) {
    throw new Error(`Auth0 Management API not configured (${c.error}).`);
  }
  const res = await fetch(`https://${c.domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: c.clientId,
      client_secret: c.clientSecret,
      audience: c.audience,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management token ${res.status}: ${text.slice(0, 500)}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Management token response was not JSON.");
  }
  if (typeof data.access_token !== "string") {
    throw new Error("Management token response missing access_token.");
  }
  return { token: data.access_token, domain: c.domain };
}

/**
 * Obtains a Management API token only — use to verify M2M credentials (no user deleted).
 * @returns {{ ok: true, domain: string }}
 */
export async function verifyAuth0ManagementConnection() {
  const { domain } = await fetchManagementApiToken();
  return { ok: true, domain };
}

/**
 * Permanently delete the Auth0 user identified by `sub` (same as JWT `sub`).
 * Idempotent: 404 if user already removed is treated as success.
 */
export async function deleteAuth0UserBySub(authSubject) {
  const { token, domain } = await fetchManagementApiToken();
  const path = encodeURIComponent(authSubject);
  const res = await fetch(`https://${domain}/api/v2/users/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204 || res.status === 404) {
    return { ok: true };
  }
  const t = await res.text();
  throw new Error(`Auth0 delete user failed ${res.status}: ${t.slice(0, 500)}`);
}

/**
 * Dev / explicit opt-in: exchange M2M credentials, GET /api/v2/users?per_page=5.
 * @returns {Promise<{ status: "success", count: number, sample_users: unknown[], domain_used: string, audience: string } | { status: "error", error: string, details: string }>}
 */
export async function runM2mAdminSmokeTest() {
  try {
    const { token, domain } = await fetchManagementApiToken();
    const audience = `https://${domain}/api/v2/`;
    const listUrl = `https://${domain}/api/v2/users?per_page=5&page=0&include_totals=false`;
    const res = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const text = await res.text();
    if (!res.ok) {
      let hint;
      if (res.status === 403) {
        hint =
          "M2M app is missing a required scope. Open Auth0 → Applications → your M2M app → APIs → Auth0 Management API → add read:users (list users needs it; delete:users alone is not enough for GET /users).";
      } else if (res.status === 401) {
        hint = "Management API rejected the token — check M2M client id/secret and audience.";
      }
      return {
        status: "error",
        error: `Management API list users failed (HTTP ${res.status})`,
        details: text.slice(0, 2000),
        hint,
        domain_used: domain,
        audience,
        list_url: listUrl,
      };
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        status: "error",
        error: "List users response was not JSON",
        details: text.slice(0, 2000),
        domain_used: domain,
        audience,
      };
    }
    const users = Array.isArray(data) ? data : data.users ?? [];
    const sample_users = users.slice(0, 5).map((u) => ({
      user_id: u.user_id,
      email: u.email ?? null,
      name: u.name ?? null,
      picture: u.picture ?? null,
    }));
    return {
      status: "success",
      count: users.length,
      sample_users,
      domain_used: domain,
      audience,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    let hint;
    if (/client_credentials|unauthorized_client|Grant type/i.test(msg)) {
      hint =
        "Token exchange failed — ensure the app is Machine-to-Machine and Client Credentials grant is enabled (Auth0 → Application → Advanced → Grant Types).";
    } else if (/Management token 40[13]/i.test(msg)) {
      hint = "Check AUTH0_MGMT_CLIENT_ID / AUTH0_MGMT_CLIENT_SECRET and that the M2M app is authorized for Auth0 Management API.";
    }
    return {
      status: "error",
      error: msg,
      details: stack ? `${msg}\n${stack}` : msg,
      hint,
    };
  }
}
