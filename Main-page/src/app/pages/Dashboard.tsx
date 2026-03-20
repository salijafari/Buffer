import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Paper,
  Toolbar,
} from "@mui/material";
import { useClerk } from "@clerk/react";
import { CreditCard, Home, LineChart, Sparkles, User } from "lucide-react";
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

function DashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";

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
            gap: 1.5,
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
          <Button
            size="small"
            color="inherit"
            onClick={() => void signOut().then(() => navigate("/onboarding", { replace: true }))}
            sx={{ color: "text.secondary", fontSize: 12, flexShrink: 0 }}
          >
            Sign out
          </Button>
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
          {TABS.map(({ id, label, Icon }) => (
            <BottomNavigationAction
              key={id}
              value={id}
              label={label}
              icon={<Icon size={22} strokeWidth={1.75} aria-hidden />}
            />
          ))}
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
