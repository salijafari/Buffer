import { getBffCsrfTokenFromDocument } from "@/lib/bffSession";

export type AdminVerifyResponse = { isAdmin: boolean; email: string };

export type AdminStats = {
  totalUsers: number;
  completedOnboarding: number;
  inProgress: number;
  notStarted: number;
  byStep: Record<string, number>;
  completionRate: number;
  avgStepInProgress: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clerkUserId: string;
  registrationDate: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  removedAt: string | null;
};

export type AdminUsersResponse = {
  users: AdminUserRow[];
  total: number;
  page: number;
  totalPages: number;
};

export type AdminUserDetail = AdminUserRow & {
  interestSelection: string | null;
  interestCustomText: string;
  provinceCode: string;
  provinceName: string;
  creditScore: number | null;
  annualPreTaxIncome: number | null;
  heardAboutUs: string | null;
  heardAboutUsOther: string;
  updatedAt: string;
};

function csrfHeaders(): HeadersInit {
  const t = getBffCsrfTokenFromDocument();
  return {
    "Content-Type": "application/json",
    ...(t ? { "X-CSRF-Token": t } : {}),
  };
}

export async function fetchAdminVerify(signal?: AbortSignal): Promise<AdminVerifyResponse> {
  const r = await fetch("/api/admin/verify", { credentials: "include", signal });
  const data = (await r.json().catch(() => ({}))) as Partial<AdminVerifyResponse>;
  if (!r.ok) throw new Error("verify failed");
  return {
    isAdmin: Boolean(data.isAdmin),
    email: typeof data.email === "string" ? data.email : "",
  };
}

export async function fetchAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  const r = await fetch("/api/admin/stats", { credentials: "include", signal });
  if (!r.ok) throw new Error("stats failed");
  return r.json() as Promise<AdminStats>;
}

export async function fetchAdminUsers(
  params: { page?: number; limit?: number; search?: string; sort?: string; order?: "asc" | "desc" },
  signal?: AbortSignal,
): Promise<AdminUsersResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  if (params.order) q.set("order", params.order);
  const r = await fetch(`/api/admin/users?${q}`, { credentials: "include", signal });
  if (!r.ok) throw new Error("users failed");
  return r.json() as Promise<AdminUsersResponse>;
}

export async function fetchAdminUser(id: string, signal?: AbortSignal): Promise<{ user: AdminUserDetail }> {
  const r = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { credentials: "include", signal });
  if (!r.ok) throw new Error("user failed");
  return r.json() as Promise<{ user: AdminUserDetail }>;
}

export async function deleteAdminUser(id: string): Promise<void> {
  const r = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: csrfHeaders(),
  });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string; hint?: string };
    throw new Error(j.hint ? `${j.error ?? "Error"}: ${j.hint}` : j.error ?? `HTTP ${r.status}`);
  }
}

export type AdminGrantRow = { email: string; grantedAt: string; grantedBy: string };

export async function fetchAdmins(signal?: AbortSignal): Promise<{ admins: AdminGrantRow[] }> {
  const r = await fetch("/api/admin/admins", { credentials: "include", signal });
  if (!r.ok) throw new Error("admins failed");
  return r.json() as Promise<{ admins: AdminGrantRow[] }>;
}

export async function grantAdmin(email: string): Promise<{ ok: boolean; alreadyAdmin?: boolean }> {
  const r = await fetch("/api/admin/admins", {
    method: "POST",
    credentials: "include",
    headers: csrfHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = (await r.json().catch(() => ({}))) as { ok?: boolean; alreadyAdmin?: boolean; error?: string };
  if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
  return { ok: true, alreadyAdmin: data.alreadyAdmin };
}

export async function revokeAdmin(email: string): Promise<void> {
  const r = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
    method: "DELETE",
    credentials: "include",
    headers: csrfHeaders(),
  });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? `HTTP ${r.status}`);
  }
}
