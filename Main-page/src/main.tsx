import { useEffect, useState, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import App from "./app/App.tsx";
import PayoffCalculator from "./app/pages/PayoffCalculator.tsx";
import Onboarding from "./app/pages/Onboarding.tsx";
import OnboardingFlow from "./app/pages/OnboardingFlow.tsx";
import Dashboard from "./app/pages/Dashboard.tsx";
import { bootstrapOnboardingFromDb, ONBOARDING_GATE_TIMEOUT_MS } from "./app/lib/onboardingStatus";
import type { UserOnboardingProfile } from "./app/lib/onboardingProfile";
import { BffAuthProvider, useBffAuth } from "./lib/BffAuthContext";
import "./styles/index.css";

type LoadingPhase = "auth" | "onboarding";

function AuthLoadingScreen({ phase = "auth" }: { phase?: LoadingPhase }) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const lateHint =
    phase === "onboarding"
      ? "Still checking onboarding status. Run the API in another terminal: npm run dev:api (port 3000). Vite proxies /api to it."
      : "Still loading session. Confirm Main-page/.env has AUTH0_CLIENT_SECRET and AUTH0_CALLBACK_URL (e.g. http://localhost:5173/api/auth/callback), restart the API, and hard refresh.";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1.5,
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <CircularProgress aria-label="Loading" />
      {showHint ? (
        <Box sx={{ color: "text.secondary", textAlign: "center", maxWidth: 520, fontSize: "0.95rem" }}>
          {lateHint}
        </Box>
      ) : null}
    </Box>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { state } = useBffAuth();

  if (state.status === "loading") return <AuthLoadingScreen />;
  if (state.status === "anon") {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}

function RequireCompletedOnboarding({ children }: { children: ReactElement }) {
  const { state } = useBffAuth();
  const [completed, setCompleted] = useState<boolean | null>(null);

  const userId = state.status === "auth" ? state.user.sub : null;

  useEffect(() => {
    if (state.status !== "auth" || !userId) return;
    let active = true;
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), ONBOARDING_GATE_TIMEOUT_MS);

    bootstrapOnboardingFromDb(ac.signal)
      .then((result) => {
        if (!active) return;
        setCompleted(result.onboarding_completed);
      })
      .catch(() => {
        if (!active) return;
        setCompleted(false);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      ac.abort();
      clearTimeout(timeoutId);
    };
  }, [state.status, userId]);

  if (state.status === "loading") return <AuthLoadingScreen />;
  if (state.status === "anon" || !userId) return <Navigate to="/onboarding" replace />;
  if (completed === null) return <AuthLoadingScreen phase="onboarding" />;
  if (!completed) {
    return <Navigate to="/onboarding/flow" replace />;
  }
  return children;
}

type GateState =
  | { kind: "loading" }
  | { kind: "dashboard" }
  | { kind: "flow"; profile: UserOnboardingProfile | null; error?: string };

function OnboardingFlowGate() {
  const { state } = useBffAuth();
  const userId = state.status === "auth" ? state.user.sub : null;
  const [gate, setGate] = useState<GateState>({ kind: "loading" });
  const [bootstrapKey, setBootstrapKey] = useState(0);

  const runBootstrap = () => {
    setGate({ kind: "loading" });
    setBootstrapKey((k) => k + 1);
  };

  useEffect(() => {
    if (state.status !== "auth" || !userId) return;
    let active = true;
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), ONBOARDING_GATE_TIMEOUT_MS);

    bootstrapOnboardingFromDb(ac.signal)
      .then((result) => {
        if (!active) return;
        if (result.onboarding_completed) {
          setGate({ kind: "dashboard" });
          return;
        }
        setGate({
          kind: "flow",
          profile: result.profile ?? null,
          error: result.error,
        });
      })
      .catch(() => {
        if (!active) return;
        setGate({ kind: "flow", profile: null, error: "Unexpected error loading onboarding." });
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      ac.abort();
      clearTimeout(timeoutId);
    };
  }, [state.status, userId, bootstrapKey]);

  if (state.status === "loading") return <AuthLoadingScreen />;
  if (state.status === "anon" || !userId) return <Navigate to="/onboarding" replace />;
  if (gate.kind === "loading") return <AuthLoadingScreen phase="onboarding" />;
  if (gate.kind === "dashboard") return <Navigate to="/dashboard" replace />;

  return (
    <OnboardingFlow
      key={bootstrapKey}
      profile={gate.profile}
      bootstrapError={gate.error}
      onRetryBootstrap={runBootstrap}
      onCompletedNavigate={() => {}}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <BffAuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payoff-calculator" element={<PayoffCalculator />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/flow" element={<OnboardingFlowGate />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireCompletedOnboarding>
                <Dashboard />
              </RequireCompletedOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/payoff"
          element={
            <RequireAuth>
              <RequireCompletedOnboarding>
                <Dashboard />
              </RequireCompletedOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/ai"
          element={
            <RequireAuth>
              <RequireCompletedOnboarding>
                <Dashboard />
              </RequireCompletedOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/credit"
          element={
            <RequireAuth>
              <RequireCompletedOnboarding>
                <Dashboard />
              </RequireCompletedOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/account"
          element={
            <RequireAuth>
              <RequireCompletedOnboarding>
                <Dashboard />
              </RequireCompletedOnboarding>
            </RequireAuth>
          }
        />
      </Routes>
    </BffAuthProvider>
  </BrowserRouter>,
);
