import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchBffMe, type BffUser } from "./bffSession";

export type BffAuthState =
  | { status: "loading"; user: null }
  | { status: "anon"; user: null }
  | { status: "auth"; user: BffUser };

type BffAuthContextValue = {
  state: BffAuthState;
  refresh: () => Promise<void>;
};

const BffAuthContext = createContext<BffAuthContextValue | null>(null);

export function BffAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BffAuthState>({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    setState({ status: "loading", user: null });
    const me = await fetchBffMe();
    if (me.authenticated) {
      setState({ status: "auth", user: me.user });
    } else {
      setState({ status: "anon", user: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <BffAuthContext.Provider value={{ state, refresh }}>{children}</BffAuthContext.Provider>;
}

export function useBffAuth() {
  const ctx = useContext(BffAuthContext);
  if (!ctx) {
    throw new Error("useBffAuth must be used within BffAuthProvider");
  }
  return ctx;
}
