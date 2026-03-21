import { randomUUID } from "node:crypto";

/** OAuth authorize handoff: state -> PKCE + return path */
const pendingOAuth = new Map();

/** sessionId -> session record */
const sessions = new Map();

const PENDING_TTL_MS = 15 * 60 * 1000;

export function savePendingOAuth(state, payload) {
  pendingOAuth.set(state, { ...payload, createdAt: Date.now() });
}

export function takePendingOAuth(state) {
  const v = pendingOAuth.get(state);
  pendingOAuth.delete(state);
  return v ?? null;
}

export function prunePendingOAuth() {
  const now = Date.now();
  for (const [k, v] of pendingOAuth) {
    if (now - v.createdAt > PENDING_TTL_MS) pendingOAuth.delete(k);
  }
}

setInterval(prunePendingOAuth, 60_000).unref?.();
export function createSessionRecord(data) {
  const id = randomUUID();
  sessions.set(id, data);
  return id;
}

export function getSessionRecord(id) {
  return sessions.get(id) ?? null;
}

export function updateSessionRecord(id, patch) {
  const cur = sessions.get(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  sessions.set(id, next);
  return next;
}

export function deleteSessionRecord(id) {
  sessions.delete(id);
}

