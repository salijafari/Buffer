import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  Toolbar,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { CreditCard, Home, LineChart, Sparkles, User } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HomeScreen } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen } from "../dashboard/components/ai/AiScreen";
import { CreditScreen } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";
import bufferLogoTransparent from "@/assets/Buffer Logo Transparent.png";
import { MaterialShell } from "../material/MaterialShell";

const TABS = [
  { id: "home", label: "Overview", path: "/dashboard", Icon: Home },
  { id: "payoff", label: "Payoff Planner", path: "/dashboard/payoff", Icon: LineChart },
  { id: "credit", label: "Credit Builder", path: "/dashboard/credit", Icon: CreditCard },
  { id: "ai", label: "AI Assistant", path: "/dashboard/ai", Icon: Sparkles },
  { id: "account", label: "Account", path: "/dashboard/account", Icon: User },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Per-tab motion so each destination feels distinct on tap */
const navAnim = {
  home: keyframes`
    0% { transform: scale(1) translateY(0); }
    35% { transform: scale(1.2) translateY(-5px); }
    65% { transform: scale(0.92) translateY(1px); }
    100% { transform: scale(1) translateY(0); }
  `,
  payoff: keyframes`
    0% { transform: rotate(0deg) scale(1); }
    30% { transform: rotate(-10deg) scale(1.12); }
    60% { transform: rotate(8deg) scale(1.06); }
    100% { transform: rotate(0deg) scale(1); }
  `,
  credit: keyframes`
    0% { transform: translateX(0) scale(1); }
    25% { transform: translateX(-4px) scale(1.08); }
    50% { transform: translateX(4px) scale(1.08); }
    75% { transform: translateX(-2px) scale(1.04); }
    100% { transform: translateX(0) scale(1); }
  `,
  ai: keyframes`
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.15) rotate(-12deg); }
    50% { transform: scale(1.1) rotate(12deg); }
    75% { transform: scale(1.05) rotate(-6deg); }
    100% { transform: scale(1) rotate(0deg); }
  `,
  account: keyframes`
    0% { transform: scale(1); }
    40% { transform: scale(1.14) translateY(-3px); }
    70% { transform: scale(0.94); }
    100% { transform: scale(1); }
  `,
} satisfies Record<TabId, ReturnType<typeof keyframes>>;

const NAV_ANIM_MS = 0.42;
const NAV_ANIM_EASE = "cubic-bezier(0.34, 1.25, 0.64, 1)";

function DashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";

  /** Increment on each tap so the icon remounts and the keyframes replay (including re-tapping the active tab). */
  const [iconPulse, setIconPulse] = useState<Partial<Record<TabId, number>>>({});
  const bumpNavIcon = useCallback((tabId: TabId) => {
    setIconPulse((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  }, []);

  const bottomPad = "calc(72px + env(safe-area-inset-bottom, 0px))";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="sticky" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar
          sx={{
            maxWidth: 672,
            width: "100%",
            mx: "auto",
            minHeight: 56,
            px: 2,
          }}
        >
          <Box
            sx={{
              height: 32,
              minWidth: 0,
              flex: 1,
              maxWidth: "min(200px, 55vw)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={bufferLogoTransparent}
              alt="Buffer"
              decoding="async"
              sx={{
                display: "block",
                height: 32,
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          pb: bottomPad,
        }}
      >
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "payoff" && <PayoffScreen />}
        {activeTab === "ai" && <AiScreen />}
        {activeTab === "credit" && <CreditScreen />}
        {activeTab === "account" && <AccountScreen />}
      </Box>

      <Paper
        square
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderTop: 1,
          borderColor: "divider",
          pb: "max(8px, env(safe-area-inset-bottom, 0px))",
          pt: 0.5,
        }}
      >
        <BottomNavigation
          value={activeTab}
          showLabels
          onChange={(_, newValue) => {
            const tab = TABS.find((t) => t.id === newValue);
            if (tab) void navigate(tab.path);
          }}
          sx={{
            bgcolor: "background.paper",
            height: "auto",
            minHeight: 56,
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              maxWidth: "20%",
              py: 0.5,
              px: 0.25,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: { xs: "0.62rem", sm: "0.7rem" },
              lineHeight: 1.15,
              whiteSpace: "normal",
              "&.Mui-selected": { fontSize: { xs: "0.62rem", sm: "0.7rem" } },
            },
          }}
        >
          {TABS.map(({ id, label, Icon }) => {
            const pulse = iconPulse[id] ?? 0;
            const kf = navAnim[id];
            return (
              <BottomNavigationAction
                key={id}
                value={id}
                label={label}
                onClick={() => bumpNavIcon(id)}
                icon={
                  <Box
                    key={pulse}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transformOrigin: "center center",
                      willChange: pulse > 0 ? "transform" : undefined,
                      animation:
                        pulse > 0
                          ? `${kf} ${NAV_ANIM_MS}s ${NAV_ANIM_EASE} both`
                          : "none",
                    }}
                  >
                    <Icon size={22} strokeWidth={1.75} aria-hidden />
                  </Box>
                }
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default function Dashboard() {
  return (
    <MaterialShell>
      <DashboardContent />
    </MaterialShell>
  );
}
