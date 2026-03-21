import { Link } from "react-router";

export function Forbidden403() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">403</p>
      <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
      <p className="max-w-md text-slate-600">
        You don&apos;t have permission to view the admin dashboard. Only authorized Buffer administrators can access this
        area.
      </p>
      <Link
        to="/dashboard"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to app
      </Link>
    </div>
  );
}
