import {
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { Bell, CreditCard, Home, LineChart, Sparkles, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HomeScreen, HomeRightRail } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen, type PayoffRailMetrics } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen, AI_SUGGESTED_PROMPTS } from "../dashboard/components/ai/AiScreen";
import { CreditScreen, CreditGraduationRail } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";
import bufferLogoTransparent from "@/assets/Buffer Logo Transparent.png";
import { MaterialShell } from "../material/MaterialShell";
import { DebtFreeSavingsCallout } from "../dashboard/components/charts/DebtFreeChart";

const SIDEBAR_BG = "#FFFFFF";
const RAIL_BG = "#F8FAFC";
const NAV_MUTED = "#64748B";
const MAIN_MAX = 720;
const SIDEBAR_W = 220;
const RAIL_W = 300;

const TABS = [
  { id: "home", label: "Overview", shortTitle: "Home", path: "/dashboard", Icon: Home },
  { id: "payoff", label: "Payoff Planner", shortTitle: "Payoff", path: "/dashboard/payoff", Icon: LineChart },
  { id: "credit", label: "Credit Builder", shortTitle: "Credit", path: "/dashboard/credit", Icon: CreditCard },
  { id: "ai", label: "AI Assistant", shortTitle: "AI", path: "/dashboard/ai", Icon: Sparkles },
  { id: "account", label: "Account", shortTitle: "Account", path: "/dashboard/account", Icon: User },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

function DesktopTopBar({ title }: { title: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        display: { xs: "none", lg: "flex" },
        py: 2,
        px: 0,
        borderBottom: 1,
        borderColor: "divider",
        mb: 2,
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton aria-label="Notifications" size="medium" color="inherit">
          <Badge color="primary" variant="dot" overlap="circular">
            <Bell size={22} strokeWidth={1.75} />
          </Badge>
        </IconButton>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>A</Avatar>
      </Stack>
    </Stack>
  );
}

function DashboardContent() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";

  const [iconPulse, setIconPulse] = useState<Partial<Record<TabId, number>>>({});
  const bumpNavIcon = useCallback((tabId: TabId) => {
    setIconPulse((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  }, []);

  const [payoffMetrics, setPayoffMetrics] = useState<PayoffRailMetrics | null>(null);
  const aiSendRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (activeTab !== "payoff") setPayoffMetrics(null);
  }, [activeTab]);

  const bottomPad = "calc(72px + env(safe-area-inset-bottom, 0px))";

  const pageTitle = TABS.find((t) => t.id === activeTab)?.shortTitle ?? "Home";

  const showRightRail =
    isDesktop && activeTab !== "account";

  function renderRightRail() {
    if (!showRightRail) return null;
    switch (activeTab) {
      case "home":
        return <HomeRightRail />;
      case "payoff":
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Payoff insights
            </Typography>
            {payoffMetrics && payoffMetrics.interestSaved >= 10 ? (
              <DebtFreeSavingsCallout
                interestSaved={payoffMetrics.interestSaved}
                monthsSaved={payoffMetrics.monthsSaved}
                totalBalance={payoffMetrics.totalBalance}
              />
            ) : null}
            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Buffer Credit Line
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: "#00C9A7", mt: 0.5 }}>
                Active
              </Typography>
            </Box>
          </Stack>
        );
      case "ai":
        return (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Suggested prompts
            </Typography>
            <Stack spacing={1}>
              {AI_SUGGESTED_PROMPTS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => aiSendRef.current?.(s)}
                  sx={{
                    justifyContent: "flex-start",
                    height: "auto",
                    py: 1,
                    px: 1,
                    textAlign: "left",
                    borderColor: "divider",
                    color: "text.primary",
                    bgcolor: "background.paper",
                    "& .MuiChip-label": { whiteSpace: "normal", textAlign: "left" },
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        );
      case "credit":
        return <CreditGraduationRail />;
      default:
        return null;
    }
  }

  const desktopMain = (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            overflowY: "auto",
            overflowX: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: MAIN_MAX,
              px: { xs: 2, lg: 4 },
              py: { lg: 2 },
              pb: { xs: undefined, lg: 3 },
              display: "flex",
              flexDirection: "column",
              minHeight: { lg: "100%" },
            }}
          >
            <DesktopTopBar title={pageTitle} />
            <Box sx={{ flex: { lg: activeTab === "ai" ? 1 : "none" }, minHeight: { lg: activeTab === "ai" ? 0 : "auto" }, display: "flex", flexDirection: "column" }}>
              {activeTab === "home" && <HomeScreen />}
              {activeTab === "payoff" && <PayoffScreen onPayoffMetrics={setPayoffMetrics} />}
              {activeTab === "ai" && <AiScreen sendMessageRef={aiSendRef} hideSuggestedChips />}
              {activeTab === "credit" && <CreditScreen />}
              {activeTab === "account" && <AccountScreen />}
            </Box>
          </Box>
        </Box>

        {showRightRail ? (
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              width: RAIL_W,
              flexShrink: 0,
              bgcolor: RAIL_BG,
              borderLeft: "1px solid",
              borderColor: "divider",
              overflowY: "auto",
              p: 2.5,
            }}
          >
            {renderRightRail()}
          </Box>
        ) : null}
      </Box>
    </Box>
  );

  const desktopSidebar = (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        width: SIDEBAR_W,
        flexShrink: 0,
        flexDirection: "column",
        bgcolor: SIDEBAR_BG,
        borderRight: "1px solid",
        borderColor: "divider",
        minHeight: "100vh",
        py: 2.5,
        px: 1.5,
      }}
    >
      <Box sx={{ px: 1, mb: 3 }}>
        <Box
          component="img"
          src={bufferLogoTransparent}
          alt="Buffer"
          decoding="async"
          sx={{ height: 32, width: "auto", maxWidth: "100%", objectFit: "contain", objectPosition: "left" }}
        />
      </Box>

      <List disablePadding sx={{ flex: 1 }}>
        {TABS.map(({ id, label, path, Icon }) => {
          const active = activeTab === id;
          return (
            <ListItemButton
              key={id}
              onClick={() => {
                bumpNavIcon(id);
                void navigate(path);
              }}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                py: 1.25,
                pl: 1.5,
                borderLeft: active ? "3px solid #00C9A7" : "3px solid transparent",
                bgcolor: active ? "rgba(0, 201, 167, 0.12)" : "transparent",
                "&:hover": { bgcolor: active ? "rgba(0, 201, 167, 0.16)" : "rgba(0,0,0,0.04)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? "#00C9A7" : NAV_MUTED }}>
                <Box
                  key={iconPulse[id] ?? 0}
                  sx={{
                    display: "inline-flex",
                    animation:
                      (iconPulse[id] ?? 0) > 0
                        ? `${navAnim[id]} ${NAV_ANIM_MS}s ${NAV_ANIM_EASE} both`
                        : "none",
                    transformOrigin: "center",
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: active ? 600 : 500,
                  sx: { color: active ? "text.primary" : NAV_MUTED, fontSize: "0.8125rem", lineHeight: 1.3 },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider", px: 0.5 }}>
        <ListItemButton
          onClick={() => void navigate("/dashboard/account")}
          sx={{ borderRadius: 1.5, py: 1.25, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText", fontSize: "0.875rem", fontWeight: 700 }}>
              A
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary="Alex Chen"
            secondary="Account"
            primaryTypographyProps={{ variant: "body2", fontWeight: 600, sx: { color: "text.primary", fontSize: "0.8125rem" } }}
            secondaryTypographyProps={{ variant: "caption", sx: { color: NAV_MUTED } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (isDesktop) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", bgcolor: "background.default" }}>
        {desktopSidebar}
        {desktopMain}
      </Box>
    );
  }

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
                        pulse > 0 ? `${kf} ${NAV_ANIM_MS}s ${NAV_ANIM_EASE} both` : "none",
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
