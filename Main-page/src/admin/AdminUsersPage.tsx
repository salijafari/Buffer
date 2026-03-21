import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { fetchAdminUsers, type AdminUserRow } from "./lib/adminApi";

const SORT_KEYS = ["createdAt", "email", "onboardingStep", "onboardingCompleted"] as const;
type SortKey = (typeof SORT_KEYS)[number];

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const ac = new AbortController();
    fetchAdminUsers({ page, limit: 50, search, sort, order }, ac.signal)
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [page, search, sort, order]);

  useEffect(() => {
    const cleanup = load();
    return typeof cleanup === "function" ? cleanup : undefined;
  }, [load]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setOrder("asc");
    }
    setPage(1);
  }

  function applySearch(e: FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  const thBtn = (key: SortKey, label: string) => (
    <button
      type="button"
      className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900"
      onClick={() => toggleSort(key)}
    >
      {label}
      {sort === key ? (order === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User management</h1>
        <p className="mt-1 text-sm text-slate-600">{total} users (active, not removed)</p>
      </div>

      <form onSubmit={applySearch} className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search email or name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Search
        </button>
      </form>

      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3">{thBtn("email", "Email")}</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">{thBtn("createdAt", "Registered")}</th>
              <th className="px-4 py-3">{thBtn("onboardingCompleted", "Status")}</th>
              <th className="px-4 py-3">{thBtn("onboardingStep", "Step")}</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(u.registrationDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.onboardingCompleted ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {u.onboardingCompleted ? "Completed" : "In progress"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.onboardingStep}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="font-medium text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
