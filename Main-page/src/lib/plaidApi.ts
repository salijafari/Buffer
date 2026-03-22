import { bffAuthHeadersForMutation } from "@/lib/bffSession";

export type PlaidConnectionStatus = {
  connected: boolean;
  status: string;
};

export async function fetchPlaidConnectionStatus(signal?: AbortSignal): Promise<PlaidConnectionStatus> {
  const res = await fetch("/api/plaid/connection-status", {
    credentials: "include",
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(`connection-status failed (${res.status}): ${raw.slice(0, 200)}`);
  }
  return res.json() as Promise<PlaidConnectionStatus>;
}

export async function createPlaidLinkToken(signal?: AbortSignal): Promise<string> {
  const res = await fetch("/api/plaid/create-link-token", {
    method: "POST",
    credentials: "include",
    headers: { ...bffAuthHeadersForMutation(), Accept: "application/json" },
    signal,
  });
  const data = (await res.json().catch(() => ({}))) as { link_token?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `create-link-token failed (${res.status})`);
  }
  if (typeof data.link_token !== "string") {
    throw new Error("Invalid response: missing link_token");
  }
  return data.link_token;
}

export async function exchangePlaidPublicToken(
  publicToken: string,
  metadata: unknown,
  signal?: AbortSignal,
): Promise<{ success: boolean; item_id?: string; error?: string }> {
  const res = await fetch("/api/plaid/exchange-token", {
    method: "POST",
    credentials: "include",
    headers: { ...bffAuthHeadersForMutation(), Accept: "application/json" },
    body: JSON.stringify({ public_token: publicToken, metadata }),
    signal,
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; item_id?: string; error?: string };
  if (!res.ok) {
    return { success: false, error: data.error ?? `exchange-token failed (${res.status})` };
  }
  return { success: Boolean(data.success), item_id: data.item_id };
}
