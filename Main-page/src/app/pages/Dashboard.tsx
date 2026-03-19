import { useNavigate, useLocation } from "react-router";
import { useClerk } from "@clerk/react";
import { HomeScreen } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen } from "../dashboard/components/ai/AiScreen";
import { CreditScreen } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";
import bufferLogoTransparent from "@/assets/Buffer Logo Transparent.png";

const TABS = [
  { id: "home", label: "Overview", path: "/dashboard" },
  { id: "payoff", label: "Payoff Planner", path: "/dashboard/payoff" },
  { id: "credit", label: "Credit Builder", path: "/dashboard/credit" },
  { id: "ai", label: "AI Assistant", path: "/dashboard/ai" },
  { id: "account", label: "Account", path: "/dashboard/account" },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="shrink-0 px-4 py-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 min-h-[44px]">
          {/* Fixed visual height so the logo never shifts header / layout */}
          <div className="h-8 min-w-0 flex-1 max-w-[min(200px,55vw)] flex items-center">
            <img
              src={bufferLogoTransparent}
              alt="Buffer"
              className="block h-8 w-auto max-w-full object-contain object-left"
              decoding="async"
            />
          </div>
          <button
            type="button"
            onClick={() => signOut().then(() => navigate("/onboarding", { replace: true }))}
            className="shrink-0 text-[#64748B] text-xs hover:text-[#0F172A] py-2 px-1"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "payoff" && <PayoffScreen />}
        {activeTab === "ai" && <AiScreen />}
        {activeTab === "credit" && <CreditScreen />}
        {activeTab === "account" && <AccountScreen />}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 min-h-16 h-auto pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] bg-white border-t border-[#E2E8F0] z-40 flex items-stretch justify-around px-1 gap-0.5"
        aria-label="Main navigation"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={[
                "flex-1 min-w-0 max-w-[20%] flex flex-col items-center justify-center gap-0.5 py-2 px-0.5 text-center font-medium leading-tight",
                "text-[10px] sm:text-[11px] md:text-xs",
                active ? "text-[#00C9A7]" : "text-[#64748B]",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span className="line-clamp-2 hyphens-auto">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

