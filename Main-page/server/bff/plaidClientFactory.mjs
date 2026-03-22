import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export function plaidEnvBasePath() {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  const map = {
    sandbox: PlaidEnvironments.sandbox,
    development: PlaidEnvironments.development,
    production: PlaidEnvironments.production,
  };
  return map[env] ?? PlaidEnvironments.sandbox;
}

/**
 * Sandbox secret can live in PLAID_SANDBOX_SECRET (.env.local); other envs use PLAID_SECRET.
 */
export function getPlaidSecret() {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "sandbox") {
    return process.env.PLAID_SANDBOX_SECRET || process.env.PLAID_SECRET || null;
  }
  return process.env.PLAID_SECRET || null;
}

export function getPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = getPlaidSecret();
  if (!clientId || !secret) {
    const err = new Error("Plaid is not configured (PLAID_CLIENT_ID + PLAID_SECRET or PLAID_SANDBOX_SECRET).");
    err.code = "PLAID_NOT_CONFIGURED";
    throw err;
  }
  const config = new Configuration({
    basePath: plaidEnvBasePath(),
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });
  return new PlaidApi(config);
}
