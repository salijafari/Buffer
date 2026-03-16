import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ClerkProvider } from "@clerk/react";
import App from "./app/App.tsx";
import PayoffCalculator from "./app/pages/PayoffCalculator.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payoff-calculator" element={<PayoffCalculator />} />
      </Routes>
    </BrowserRouter>
  </ClerkProvider>
);
