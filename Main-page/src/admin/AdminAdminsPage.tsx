import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { fetchAdminVerify, fetchAdmins, grantAdmin, revokeAdmin, type AdminGrantRow } from "./lib/adminApi";

export function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminGrantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const ac = new AbortController();
    Promise.all([fetchAdmins(ac.signal), fetchAdminVerify(ac.signal)])
      .then(([a, v]) => {
        setAdmins(a.admins);
        setCurrentAdminEmail(v.email.trim().toLowerCase());
      })
      .catch(() => toast.error("Failed to load admins."))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const c = load();
    return typeof c === "function" ? c : undefined;
  }, [load]);

  async function onGrant(e: FormEvent) {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      toast.error("Enter an email.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await grantAdmin(email);
      toast.success(r.alreadyAdmin ? "User is already an admin." : "Admin access granted.");
      setEmailInput("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grant failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRevoke(email: string) {
    if (!window.confirm(`Revoke admin for ${email}?`)) return;
    try {
      await revokeAdmin(email);
      toast.success("Admin revoked.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin management</h1>
        <p className="mt-1 text-sm text-slate-600">Grant or revoke dashboard access. Initial admins are bootstrapped from server config.</p>
      </div>

      <form onSubmit={(e) => void onGrant(e)} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add admin</h2>
        <p className="mt-1 text-sm text-slate-500">User should already exist in the app (onboarding profile) for profile flags to sync.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Make admin
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Date added</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Added by</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (
              admins.map((a) => {
                const isSelf = a.email.toLowerCase() === currentAdminEmail;
                return (
                  <tr key={a.email} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{a.email}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(a.grantedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{a.grantedBy}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-slate-400">You</span>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:underline"
                          onClick={() => void onRevoke(a.email)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
