import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { getPlaidSecret } from "./plaidClientFactory.mjs";

const ALG = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

/**
 * Derives a 32-byte key for AES-256-GCM.
 * Production: set PLAID_ACCESS_TOKEN_ENCRYPTION_KEY to 32 raw bytes encoded as base64
 * (`openssl rand -base64 32`).
 */
export function getPlaidTokenEncryptionKey() {
  const b64 = process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY;
  if (b64) {
    const buf = Buffer.from(b64, "base64");
    if (buf.length !== 32) {
      throw new Error("PLAID_ACCESS_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (base64).");
    }
    return buf;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("PLAID_ACCESS_TOKEN_ENCRYPTION_KEY is required in production.");
  }
  return scryptSync(getPlaidSecret() || "plaid-dev-only-insecure", "buffer-plaid-salt", 32);
}

export function encryptPlaidAccessToken(plaintext) {
  const key = getPlaidTokenEncryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALG, key, iv, { authTagLength: AUTH_TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptPlaidAccessToken(payloadB64) {
  const key = getPlaidTokenEncryptionKey();
  const buf = Buffer.from(payloadB64, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
  const data = buf.subarray(IV_LEN + AUTH_TAG_LEN);
  const decipher = createDecipheriv(ALG, key, iv, { authTagLength: AUTH_TAG_LEN });
  decipher.setAuthTag(tag);
  return decipher.update(data, undefined, "utf8") + decipher.final("utf8");
}
