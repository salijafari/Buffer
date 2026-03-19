import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ClerkProvider } from "@clerk/react";
import App from "./app/App.tsx";
import PayoffCalculator from "./app/pages/PayoffCalculator.tsx";
import Onboarding from "./app/pages/Onboarding.tsx";
import OnboardingFlow from "./app/pages/OnboardingFlow.tsx";
import Dashboard from "./app/pages/Dashboard.tsx";
import "./styles/index.css";

const signUpForceRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL ?? "/onboarding/flow";
const signUpFallbackRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/onboarding/flow";
const signInForceRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL ?? "/dashboard";
const signInFallbackRedirectUrl =
  import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/dashboard";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    signUpForceRedirectUrl={signUpForceRedirectUrl}
    signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
    signInForceRedirectUrl={signInForceRedirectUrl}
    signInFallbackRedirectUrl={signInFallbackRedirectUrl}
  >
    <BrowserRouter>
      <Routes>
        {/* Public marketing routes */}
        <Route path="/" element={<App />} />
        <Route path="/payoff-calculator" element={<PayoffCalculator />} />

        {/* Auth entry: shows Clerk sign-up/sign-in modal; redirects authenticated users */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Onboarding wizard: 7-step KYC → eligibility → PAD flow */}
        <Route path="/onboarding/flow" element={<OnboardingFlow />} />

        {/* Dashboard: home, payoff, AI, credit, account tabs */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/payoff" element={<Dashboard />} />
        <Route path="/dashboard/ai" element={<Dashboard />} />
        <Route path="/dashboard/credit" element={<Dashboard />} />
        <Route path="/dashboard/account" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </ClerkProvider>
);
