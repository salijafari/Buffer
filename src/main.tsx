import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ClerkProvider } from "@clerk/react";
import App from "./app/App.tsx";
import PayoffCalculator from "./app/pages/PayoffCalculator.tsx";
import Onboarding from "./app/pages/Onboarding.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payoff-calculator" element={<PayoffCalculator />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  </ClerkProvider>
);
