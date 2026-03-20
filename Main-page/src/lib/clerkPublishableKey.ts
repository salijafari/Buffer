/**
 * Validates the Clerk publishable key shape. Clerk encodes instance info in the suffix
 * (often base64/base64url); characters like `$` or `.` can appear — do not over-restrict.
 */
export function validateClerkPublishableKey(key: string | undefined): { ok: true } | { ok: false; message: string } {
  const trimmed = (key ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "");
  if (!trimmed) {
    return {
      ok: false,
      message:
        "Missing publishable key. Add VITE_CLERK_PUBLISHABLE_KEY to Main-page/.env, then restart Vite (stop and run npm run dev again).",
    };
  }

  if (!trimmed.startsWith("pk_test_") && !trimmed.startsWith("pk_live_")) {
    return {
      ok: false,
      message:
        "Publishable key must start with pk_test_ or pk_live_. Copy it from Clerk Dashboard → Configure → API Keys.",
    };
  }

  // Reject obvious empty/partial paste (prefix only).
  if (trimmed.length < 16) {
    return {
      ok: false,
      message:
        "Publishable key looks incomplete. Copy the full value from Clerk Dashboard → API Keys (entire line after “Publishable key”).",
    };
  }

  // Suffix is instance-specific; allow any non-whitespace (Clerk SDK validates fully).
  if (!/^pk_(test|live)_[^\s]+$/.test(trimmed)) {
    return {
      ok: false,
      message: "Publishable key has invalid characters. Paste the key exactly from Clerk Dashboard → API Keys.",
    };
  }

  return { ok: true };
}
