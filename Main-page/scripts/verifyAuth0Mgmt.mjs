#!/usr/bin/env node
/**
 * Loads Main-page/.env + .env.local (same as server/index.mjs) and checks M2M → Management API token.
 * Usage: node scripts/verifyAuth0Mgmt.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { verifyAuth0ManagementConnection } from "../server/bff/auth0Management.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(root, ".env.local"), override: true });
}

try {
  const r = await verifyAuth0ManagementConnection();
  console.log(`OK: Auth0 Management API token obtained for domain: ${r.domain}`);
  process.exit(0);
} catch (e) {
  console.error("FAILED:", e?.message ?? e);
  process.exit(1);
}
