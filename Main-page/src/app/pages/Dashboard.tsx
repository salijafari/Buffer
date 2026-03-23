import {
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { CreditCard, Home, LineChart, Sparkles } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HomeScreen } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen, type PayoffRailMetrics } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen, AI_SUGGESTED_PROMPTS, AI_SUGGESTED_PROMPTS_PRE } from "../dashboard/components/ai/AiScreen";
import { CreditScreen, CreditGraduationRail } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";
import bufferLogoTransparent from "@/assets/Buffer Logo Transparent.png";
import { useBffAuth } from "@/lib/BffAuthContext";
import type { BffUser } from "@/lib/bffSession";
import { MaterialShell } from "../material/MaterialShell";
import { BffUserAvatar } from "../dashboard/components/BffUserAvatar";
import { DebtFreeSavingsCallout } from "../dashboard/components/charts/DebtFreeChart";
import { DashboardNotificationsButton } from "../dashboard/components/DashboardNotificationsButton";
import { DashboardShellProvider, useDashboardShell } from "../dashboard/context/DashboardShellContext";
import { MOCK_AI_UNREAD_INSIGHTS, MOCK_CREDIT_REPORT_EVENTS } from "../dashboard/data/mockDashboard";

/** Session keys: nav badges clear after visiting AI / Credit and stay cleared for the tab session. */
const SS_NAV_AI_CLEARED = "buffer_dash_nav_ai_badge_cleared";
const SS_NAV_CREDIT_CLEARED = "buffer_dash_nav_credit_badge_cleared";

function readNavBadgeCleared(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markNavBadgeCleared(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode / quota */
  }
}

function initialNavBadges(pathnameHint?: string): { ai: number; credit: number } {
  const path = pathnameHint ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const ai = path === "/dashboard/ai" || readNavBadgeCleared(SS_NAV_AI_CLEARED) ? 0 : MOCK_AI_UNREAD_INSIGHTS;
  const credit =
    path === "/dashboard/credit" || readNavBadgeCleared(SS_NAV_CREDIT_CLEARED) ? 0 : MOCK_CREDIT_REPORT_EVENTS;
  return { ai, credit };
}

const RAIL_BG = "#F8FAFC";
const NAV_MUTED = "#64748B";
/** Main column when a right rail is visible (Payoff / Credit / AI). */
const MAIN_MAX_WITH_RAIL = 760;
/** Main column on Overview — no right rail (`max-w-screen-2xl` ≈ 1536px in Stitch HTML). */
const MAIN_MAX_OVERVIEW = 1536;
const RAIL_W = 300;

const TABS = [
  { id: "home", label: "Overview", shortTitle: "Home", path: "/dashboard", Icon: Home },
  { id: "payoff", label: "Payoff Planner", shortTitle: "Payoff", path: "/dashboard/payoff", Icon: LineChart },
  { id: "credit", label: "Credit Builder", shortTitle: "Credit", path: "/dashboard/credit", Icon: CreditCard },
  { id: "ai", label: "AI Assistant", shortTitle: "AI", path: "/dashboard/ai", Icon: Sparkles },
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
} satisfies Record<TabId, ReturnType<typeof keyframes>>;

const NAV_ANIM_MS = 0.42;
const NAV_ANIM_EASE = "cubic-bezier(0.34, 1.25, 0.64, 1)";

/** Desktop: logo (left) + tab row (center) + notifications & avatar (right). Mobile unchanged. */
function DesktopTopTabBar({
  activeTab,
  isAccountPage,
  navBadgeCounts,
  onNavigate,
  bumpNavIcon,
  iconPulse,
  onProfileClick,
  user,
  loading,
}: {
  activeTab: TabId;
  isAccountPage: boolean;
  navBadgeCounts: { ai: number; credit: number };
  onNavigate: (path: string) => void;
  bumpNavIcon: (id: TabId) => void;
  iconPulse: Partial<Record<TabId, number>>;
  onProfileClick: () => void;
  user: BffUser | null;
  loading: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: "#ffffff",
        borderBottom: 1,
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box
        sx={{
          maxWidth: "min(1536px, 100%)",
          mx: "auto",
          px: { lg: 3, xl: 4 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: { lg: 2, xl: 3 },
          minHeight: 72,
          boxSizing: "border-box",
        }}
      >
        <Box
          component="img"
          src={bufferLogoTransparent}
          alt="Buffer"
          decoding="async"
          sx={{
            height: 32,
            width: "auto",
            maxWidth: { lg: 140, xl: 180 },
            objectFit: "contain",
            objectPosition: "left center",
            flexShrink: 0,
            display: "block",
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          spacing={0.5}
          sx={{ flex: 1, minWidth: 0, columnGap: 0.5, rowGap: 0.5 }}
        >
          {TABS.map(({ id, label, path }) => {
            const active = !isAccountPage && activeTab === id;
            const navBadge = id === "ai" ? navBadgeCounts.ai : id === "credit" ? navBadgeCounts.credit : 0;
            return (
              <Badge key={id} badgeContent={navBadge > 0 ? navBadge : undefined} color="error" invisible={navBadge <= 0} max={99}>
                <Button
                  onClick={() => {
                    bumpNavIcon(id);
                    onNavigate(path);
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: { lg: "0.8125rem", xl: "0.875rem" },
                    fontFamily: '"Manrope", system-ui, sans-serif',
                    letterSpacing: "-0.01em",
                    color: active ? "primary.main" : NAV_MUTED,
                    borderRadius: 0,
                    px: { lg: 1.25, xl: 2 },
                    py: 1,
                    minWidth: "auto",
                    borderBottom: "2px solid",
                    borderColor: active ? "primary.main" : "transparent",
                    bgcolor: "transparent",
                    transition: "color 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      borderColor: active ? "primary.main" : alpha(theme.palette.primary.main, 0.35),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      animation:
                        (iconPulse[id] ?? 0) > 0
                          ? `${navAnim[id]} ${NAV_ANIM_MS}s ${NAV_ANIM_EASE} both`
                          : "none",
                    }}
                  >
                    {label}
                  </Box>
                </Button>
              </Badge>
            );
          })}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
          <DashboardNotificationsButton size="medium" />
          <IconButton onClick={onProfileClick} aria-label="Open account" disabled={loading} size="small">
            {loading ? (
              <Avatar sx={{ width: 36, height: 36, bgcolor: "action.hover" }} />
            ) : user ? (
              <BffUserAvatar picture={user.picture} name={user.name} email={user.email} size={36} />
            ) : (
              <BffUserAvatar picture={null} name={null} email={null} size={36} />
            )}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

function DashboardContent() {
  const theme = useTheme();
  const { connectionMode } = useDashboardShell();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const location = useLocation();
  const { state: bffState } = useBffAuth();
  const bffUser = bffState.status === "auth" ? bffState.user : null;
  const bffLoading = bffState.status === "loading";
  const activeTab = TABS.find((t) => location.pathname === t.path)?.id ?? "home";
  const isAccountPage = location.pathname === "/dashboard/account";

  const [iconPulse, setIconPulse] = useState<Partial<Record<TabId, number>>>({});
  const bumpNavIcon = useCallback((tabId: TabId) => {
    setIconPulse((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  }, []);

  const [payoffMetrics, setPayoffMetrics] = useState<PayoffRailMetrics | null>(null);
  const aiSendRef = useRef<((text: string) => void) | null>(null);

  const [navBadgeCounts, setNavBadgeCounts] = useState(() => initialNavBadges());

  useLayoutEffect(() => {
    if (location.pathname === "/dashboard/ai") {
      markNavBadgeCleared(SS_NAV_AI_CLEARED);
      setNavBadgeCounts((prev) => (prev.ai === 0 ? prev : { ...prev, ai: 0 }));
    }
    if (location.pathname === "/dashboard/credit") {
      markNavBadgeCleared(SS_NAV_CREDIT_CLEARED);
      setNavBadgeCounts((prev) => (prev.credit === 0 ? prev : { ...prev, credit: 0 }));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab !== "payoff") setPayoffMetrics(null);
  }, [activeTab]);

  const bottomPad = "calc(72px + env(safe-area-inset-bottom, 0px))";

  /** Overview uses the full main column; right rail only for Payoff / Credit / AI. */
  const showRightRail = isDesktop && !isAccountPage && activeTab !== "home";

  const mainMaxWidthLg = activeTab === "home" ? MAIN_MAX_OVERVIEW : MAIN_MAX_WITH_RAIL;

  function renderRightRail() {
    if (!showRightRail) return null;
    switch (activeTab) {
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
              <Typography variant="body2" fontWeight={600} color="primary" sx={{ mt: 0.5 }}>
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
              {(connectionMode === "pre" ? AI_SUGGESTED_PROMPTS_PRE : AI_SUGGESTED_PROMPTS).map((s) => (
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
      <DesktopTopTabBar
        activeTab={activeTab}
        isAccountPage={isAccountPage}
        navBadgeCounts={navBadgeCounts}
        onNavigate={(path) => {
          void navigate(path);
        }}
        bumpNavIcon={bumpNavIcon}
        iconPulse={iconPulse}
        onProfileClick={() => void navigate("/dashboard/account")}
        user={bffUser}
        loading={bffLoading}
      />
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
            WebkitOverflowScrolling: "touch",
            bgcolor: activeTab === "home" && !isAccountPage ? "#f8f9fa" : "background.default",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", lg: mainMaxWidthLg },
              px: { xs: 2, sm: 3, lg: 4 },
              py: { lg: 2 },
              pb: { xs: undefined, lg: 3 },
              display: "flex",
              flexDirection: "column",
              minHeight: { lg: "100%" },
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ flex: { lg: activeTab === "ai" ? 1 : "none" }, minHeight: { lg: activeTab === "ai" ? 0 : "auto" }, display: "flex", flexDirection: "column" }}>
              {isAccountPage ? (
                <AccountScreen />
              ) : (
                <>
                  {activeTab === "home" && <HomeScreen />}
                  {activeTab === "payoff" && <PayoffScreen onPayoffMetrics={setPayoffMetrics} />}
                  {activeTab === "ai" && <AiScreen sendMessageRef={aiSendRef} hideSuggestedChips />}
                  {activeTab === "credit" && <CreditScreen />}
                </>
              )}
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

  if (isDesktop) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", bgcolor: "background.default" }}>
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
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            minHeight: 56,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box
            sx={{
              height: 32,
              minWidth: 0,
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
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
                maxWidth: "min(200px, 55vw)",
                objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, ml: "auto" }}>
            <DashboardNotificationsButton size="small" />
            <IconButton
              onClick={() => void navigate("/dashboard/account")}
              aria-label="Open account"
              edge="end"
              disabled={bffLoading}
            >
            {bffLoading ? (
              <Avatar sx={{ width: 34, height: 34, bgcolor: "action.hover" }} />
            ) : bffUser ? (
              <BffUserAvatar picture={bffUser.picture} name={bffUser.name} email={bffUser.email} size={34} />
            ) : (
              <BffUserAvatar picture={null} name={null} email={null} size={34} />
            )}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: bottomPad,
          minWidth: 0,
          width: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {isAccountPage ? (
          <AccountScreen />
        ) : (
          <>
            {activeTab === "home" && <HomeScreen />}
            {activeTab === "payoff" && <PayoffScreen onPayoffMetrics={setPayoffMetrics} />}
            {activeTab === "ai" && <AiScreen />}
            {activeTab === "credit" && <CreditScreen />}
          </>
        )}
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
          pt: 1,
          px: 1,
        }}
      >
        <BottomNavigation
          value={isAccountPage ? false : activeTab}
          showLabels
          onChange={(_, newValue) => {
            const tab = TABS.find((t) => t.id === newValue);
            if (tab) void navigate(tab.path);
          }}
          sx={{
            bgcolor: "transparent",
            width: "100%",
            height: "auto",
            minHeight: 60,
            justifyContent: "stretch",
            gap: 1.25,
            py: 0.5,
            "& .MuiBottomNavigationAction-root": {
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: "none",
              py: 0.75,
              px: 0.75,
              gap: 0.45,
              borderRadius: 2,
              border: "1px solid transparent",
              bgcolor: "transparent",
              transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderColor: alpha(theme.palette.primary.main, 0.42),
                boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}`,
              },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: { xs: "0.65rem", sm: "0.72rem" },
              lineHeight: 1.2,
              whiteSpace: "normal",
              mt: 0.35,
              px: 0.25,
              "&.Mui-selected": { fontSize: { xs: "0.65rem", sm: "0.72rem" } },
            },
          }}
        >
          {TABS.map(({ id, label, Icon }) => {
            const pulse = iconPulse[id] ?? 0;
            const kf = navAnim[id];
            const navBadge = id === "ai" ? navBadgeCounts.ai : id === "credit" ? navBadgeCounts.credit : 0;
            return (
              <BottomNavigationAction
                key={id}
                value={id}
                label={label}
                onClick={() => bumpNavIcon(id)}
                icon={
                  <Badge badgeContent={navBadge > 0 ? navBadge : undefined} color="error" invisible={navBadge <= 0} max={99}>
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
                  </Badge>
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
      <DashboardShellProvider>
        <DashboardContent />
      </DashboardShellProvider>
    </MaterialShell>
  );
}
