import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { ClerkProvider, useAuth, useUser } from "@clerk/react";
import { Box, CircularProgress } from "@mui/material";
import App from "./app/App.tsx";
import PayoffCalculator from "./app/pages/PayoffCalculator.tsx";
import Onboarding from "./app/pages/Onboarding.tsx";
import OnboardingFlow from "./app/pages/OnboardingFlow.tsx";
import Dashboard from "./app/pages/Dashboard.tsx";
import { bootstrapOnboardingFromDb, ONBOARDING_GATE_TIMEOUT_MS } from "./app/lib/onboardingStatus";
import type { UserOnboardingProfile } from "./app/lib/onboardingProfile";
import { validateClerkPublishableKey } from "./lib/clerkPublishableKey";
import "./styles/index.css";

const signUpForceRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL ?? "/onboarding/flow";
const signUpFallbackRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/onboarding/flow";
const signInForceRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL ?? "/onboarding/flow";
const signInFallbackRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/onboarding/flow";

/** Clerk publishable key — must be `VITE_*` for Vite. Supports common mis-copies from Next/Clerk docs. */
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";

const clerkKeyValidation = validateClerkPublishableKey(clerkPublishableKey);

type LoadingPhase = "clerk" | "onboarding";

function AuthLoadingScreen({ phase = "clerk" }: { phase?: LoadingPhase }) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const lateHint =
    phase === "onboarding"
      ? "Still checking onboarding status. Run the API in another terminal: npm run dev:api (port 3000). Vite proxies /api to it."
      : "Still loading Clerk. Confirm the full publishable key from Clerk Dashboard → API Keys (long pk_test_/pk_live_ value), restart Vite after editing .env, and try a hard refresh.";

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

function ClerkPublishableKeyError({ message }: { message: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 560, textAlign: "center" }}>
        <Box sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 1.5, color: "error.main" }}>Clerk configuration</Box>
        <Box sx={{ color: "text.secondary", fontSize: "0.98rem", lineHeight: 1.6 }}>{message}</Box>
      </Box>
    </Box>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (!isSignedIn) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}

function RequireCompletedOnboarding({ children }: { children: JSX.Element }) {
  const { isLoaded, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [completed, setCompleted] = useState<boolean | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!isLoaded || !userLoaded || !userId) return;
    let active = true;
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), ONBOARDING_GATE_TIMEOUT_MS);

    console.log("[Dashboard Guard] Clerk loaded");
    console.log(`[Dashboard Guard] User authenticated: clerkUserId=${userId}`);
    console.log("[Dashboard Guard] Syncing user to DB...");

    bootstrapOnboardingFromDb(getToken, ac.signal)
      .then((result) => {
        if (!active) return;
        console.log(`[Dashboard Guard] Sync complete: onboarding_completed=${result.onboarding_completed}`);
        if (result.onboarding_completed) {
          console.log("[Dashboard Guard] Allowing /dashboard");
        } else {
          console.log("[Dashboard Guard] Redirecting to /onboarding/flow");
        }
        setCompleted(result.onboarding_completed);
      })
      .catch(() => {
        if (!active) return;
        console.warn("[Dashboard Guard] Bootstrap failed; treating as not completed");
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
  }, [isLoaded, userLoaded, userId, getToken]);

  if (!isLoaded || !userLoaded) return <AuthLoadingScreen />;
  if (!userId) return <Navigate to="/onboarding" replace />;
  if (completed === null) return <AuthLoadingScreen phase="onboarding" />;
  if (!completed) {
    return <Navigate to="/onboarding/flow" replace />;
  }
  return children;
}

type GateState =
  | { kind: "loading" }
  | { kind: "dashboard" }
  | { kind: "flow"; profile: UserOnboardingProfile | null };

function OnboardingFlowGate() {
  const { isLoaded, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const userId = user?.id;
  const [gate, setGate] = useState<GateState>({ kind: "loading" });
  const [bootstrapKey, setBootstrapKey] = useState(0);

  const runBootstrap = useCallback(() => {
    setGate({ kind: "loading" });
    setBootstrapKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded || !userLoaded || !userId) return;
    let active = true;
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), ONBOARDING_GATE_TIMEOUT_MS);

    console.log("[Onboarding Gate] Clerk loaded");
    console.log(`[Onboarding Gate] User authenticated: clerkUserId=${userId}`);
    console.log("[Onboarding Gate] Syncing user to DB...");

    bootstrapOnboardingFromDb(getToken, ac.signal)
      .then((result) => {
        if (!active) return;
        console.log(`[Onboarding Gate] Sync complete: onboarding_completed=${result.onboarding_completed}`);
        if (result.onboarding_completed) {
          console.log("[Onboarding Gate] Redirecting to /dashboard");
          setGate({ kind: "dashboard" });
          return;
        }
        setGate({ kind: "flow", profile: result.profile ?? null });
      })
      .catch(() => {
        if (!active) return;
        console.warn("[Onboarding Gate] Bootstrap failed; showing flow with no profile");
        setGate({ kind: "flow", profile: null });
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      ac.abort();
      clearTimeout(timeoutId);
    };
  }, [isLoaded, userLoaded, userId, getToken, bootstrapKey]);

  if (!isLoaded || !userLoaded) return <AuthLoadingScreen />;
  if (!userId) return <Navigate to="/onboarding" replace />;
  if (gate.kind === "loading") return <AuthLoadingScreen phase="onboarding" />;
  if (gate.kind === "dashboard") return <Navigate to="/dashboard" replace />;

  return (
    <OnboardingFlow
      key={bootstrapKey}
      profile={gate.profile}
      onRetryBootstrap={runBootstrap}
      onCompletedNavigate={() => {
        console.log("[Onboarding Gate] Redirecting to /dashboard");
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    {!clerkKeyValidation.ok ? (
      <ClerkPublishableKeyError message={clerkKeyValidation.message} />
    ) : (
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        signUpForceRedirectUrl={signUpForceRedirectUrl}
        signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
        signInForceRedirectUrl={signInForceRedirectUrl}
        signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      >
        <Routes>
          {/* Public marketing routes */}
          <Route path="/" element={<App />} />
          <Route path="/payoff-calculator" element={<PayoffCalculator />} />

          {/* Auth entry: shows Clerk sign-up/sign-in modal; redirects authenticated users */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Onboarding wizard: 7-step KYC → eligibility → PAD flow */}
          <Route path="/onboarding/flow" element={<OnboardingFlowGate />} />

          {/* Dashboard: overview, payoff planner, credit builder, AI assistant, account */}
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
      </ClerkProvider>
    )}
  </BrowserRouter>,
);
