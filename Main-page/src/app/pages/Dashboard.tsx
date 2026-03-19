import { useNavigate, useLocation } from "react-router";
import { useClerk } from "@clerk/react";
import { HomeScreen } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen } from "../dashboard/components/ai/AiScreen";
import { CreditScreen } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";

const TABS = [
  { id: "home", label: "Home", path: "/dashboard" },
  { id: "payoff", label: "Payoff", path: "/dashboard/payoff" },
  { id: "ai", label: "AI", path: "/dashboard/ai" },
  { id: "credit", label: "Credit", path: "/dashboard/credit" },
  { id: "account", label: "Account", path: "/dashboard/account" },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="px-4 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-[#0F172A] font-semibold text-sm">Buffer Dashboard</span>
          <button onClick={() => signOut().then(() => navigate("/onboarding", { replace: true }))} className="text-[#64748B] text-xs hover:text-[#0F172A]">
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "payoff" && <PayoffScreen />}
        {activeTab === "ai" && <AiScreen />}
        {activeTab === "credit" && <CreditScreen />}
        {activeTab === "account" && <AccountScreen />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] z-40 flex items-center justify-around px-2" aria-label="Main navigation">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => navigate(tab.path)} className={["text-xs font-medium", active ? "text-[#00C9A7]" : "text-[#64748B]"].join(" ")} aria-current={active ? "page" : undefined}>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

