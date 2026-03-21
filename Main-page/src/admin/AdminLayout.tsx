import { NavLink, Outlet } from "react-router";
import { Toaster } from "sonner";
import { bffLogout } from "@/lib/bffSession";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster richColors position="top-center" />
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col p-4">
            <div className="mb-8 px-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Buffer</p>
              <p className="text-lg font-bold text-slate-900">Admin</p>
            </div>
            <nav className="flex flex-1 flex-col gap-1" aria-label="Admin navigation">
              <NavLink to="/admin" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                User management
              </NavLink>
              <NavLink to="/admin/admins" className={navLinkClass}>
                Admin management
              </NavLink>
            </nav>
            <button
              type="button"
              className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
              onClick={() => void bffLogout()}
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <p className="text-sm font-bold">Buffer Admin</p>
            <nav className="mt-2 flex flex-wrap gap-2 text-xs">
              <NavLink to="/admin" end className="text-sky-700 underline">
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className="text-sky-700 underline">
                Users
              </NavLink>
              <NavLink to="/admin/admins" className="text-sky-700 underline">
                Admins
              </NavLink>
              <button type="button" className="text-red-600 underline" onClick={() => void bffLogout()}>
                Logout
              </button>
            </nav>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
