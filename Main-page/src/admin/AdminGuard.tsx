import { useEffect, useState, type ReactNode } from "react";
import { fetchAdminVerify } from "./lib/adminApi";
import { Forbidden403 } from "./Forbidden403";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "ok" | "forbidden">("loading");

  useEffect(() => {
    const ac = new AbortController();
    fetchAdminVerify(ac.signal)
      .then((v) => {
        setPhase(v.isAdmin ? "ok" : "forbidden");
      })
      .catch(() => setPhase("forbidden"));
    return () => ac.abort();
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (phase === "forbidden") {
    return <Forbidden403 />;
  }

  return <>{children}</>;
}
