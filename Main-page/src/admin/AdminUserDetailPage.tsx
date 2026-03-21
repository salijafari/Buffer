import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { deleteAdminUser, fetchAdminUser, type AdminUserDetail } from "./lib/adminApi";

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    const ac = new AbortController();
    fetchAdminUser(id, ac.signal)
      .then((r) => setUser(r.user))
      .catch(() => {
        toast.error("Could not load user.");
        setUser(null);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [id]);

  useEffect(() => {
    const c = load();
    return typeof c === "function" ? c : undefined;
  }, [load]);

  async function onDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteAdminUser(id);
      toast.success("User removed from Auth0 and soft-deleted in database.");
      navigate("/admin/users");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">User not found.</p>
        <Link to="/admin/users" className="text-teal-700 underline">
          Back to list
        </Link>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["Email", user.email || "—"],
    ["Name", [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"],
    ["Auth0 ID (sub)", user.clerkUserId],
    ["Registered", new Date(user.registrationDate).toLocaleString()],
    ["Onboarding", user.onboardingCompleted ? "Completed" : "In progress"],
    ["Current step", String(user.onboardingStep)],
    ["Interest", user.interestSelection ?? "—"],
    ["Interest (other)", user.interestCustomText || "—"],
    ["Province", user.provinceCode ? `${user.provinceCode} — ${user.provinceName}` : "—"],
    ["Credit score", user.creditScore != null ? String(user.creditScore) : "—"],
    ["Annual pre-tax income", user.annualPreTaxIncome != null ? String(user.annualPreTaxIncome) : "—"],
    ["Heard about us", user.heardAboutUs ?? "—"],
    ["Heard about (other)", user.heardAboutUsOther || "—"],
    ["Updated", new Date(user.updatedAt).toLocaleString()],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/users" className="text-sm font-medium text-teal-700 hover:underline">
            ← Users
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">User profile</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete user
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <dl className="divide-y divide-slate-100">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">{k}</dt>
              <dd className="text-sm text-slate-900 sm:col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Delete this user?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This will delete the user in <strong>Auth0</strong> and mark their profile as removed in the database
              (soft delete). This cannot be undone from the admin UI.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() => void onDelete()}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
