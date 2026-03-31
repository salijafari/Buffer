import {
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { Bell, CreditCard, HelpCircle, Home, LineChart, LogOut, User } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { SHOW_CREDIT_BUILDER_IN_DASHBOARD } from "../dashboard/featureFlags";
import { useLocation, useNavigate } from "react-router";
import { HomeScreen } from "../dashboard/components/home/HomeScreen";
import { PayoffScreen } from "../dashboard/components/payoff/PayoffScreen";
import { AiScreen, AI_SUGGESTED_PROMPTS, AI_SUGGESTED_PROMPTS_PRE } from "../dashboard/components/ai/AiScreen";
import { CreditScreen } from "../dashboard/components/credit/CreditScreen";
import { AccountScreen } from "../dashboard/components/account/AccountScreen";
import { StatementsPage } from "../dashboard/components/payoff/StatementsPage";
import { SupportPage } from "../dashboard/components/support/SupportPage";
import bufferLogoTransparent from "@/assets/Buffer Logo Transparent.png";
import { useBffAuth } from "@/lib/BffAuthContext";
import { bffLogout, type BffUser } from "@/lib/bffSession";
import { MaterialShell } from "../material/MaterialShell";
import { BffUserAvatar } from "../dashboard/components/BffUserAvatar";
import { DashboardNotificationsButton } from "../dashboard/components/DashboardNotificationsButton";
import { DashboardShellProvider, useDashboardShell } from "../dashboard/context/DashboardShellContext";
import { OT } from "../dashboard/components/home/overview/overviewTokens";
import { MAIN_MAX_OVERVIEW } from "../dashboard/layout/DashboardPageMain";
import { MOCK_CREDIT_REPORT_EVENTS } from "../dashboard/data/mockDashboard";

/** Session key: Credit nav badge clears after visiting Credit Builder and stays cleared for the tab session. */
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

function initialNavBadges(pathnameHint?: string): { credit: number } {
  const path = pathnameHint ?? (typeof window !== "undefined" ? window.location.pathname : "");
  if (!SHOW_CREDIT_BUILDER_IN_DASHBOARD) return { credit: 0 };
  const credit =
    path === "/dashboard/credit" || readNavBadgeCleared(SS_NAV_CREDIT_CLEARED) ? 0 : MOCK_CREDIT_REPORT_EVENTS;
  return { credit };
}

const RAIL_BG = "#F8FAFC";
const NAV_MUTED = "#64748B";
/** Main column when a right rail is visible (Payments / Credit / legacy AI route). */
const MAIN_MAX_WITH_RAIL = 760;
const RAIL_W = 300;

const TABS = [
  { id: "home", label: "Overview", shortTitle: "Overview", path: "/dashboard", Icon: Home },
  { id: "payoff", label: "Payments", shortTitle: "Payments", path: "/dashboard/payoff", Icon: LineChart },
  { id: "credit", label: "Credit Builder", shortTitle: "Credit", path: "/dashboard/credit", Icon: CreditCard },
  { id: "account", label: "Accounts", shortTitle: "Accounts", path: "/dashboard/account", Icon: User },
] as const;

/** Tabs shown in desktop + mobile nav (Credit Builder omitted when feature flag is off). */
const NAV_TABS = SHOW_CREDIT_BUILDER_IN_DASHBOARD ? TABS : TABS.filter((t) => t.id !== "credit");

type NavTabId = (typeof TABS)[number]["id"];
/** Includes legacy `/dashboard/ai` and `/dashboard/support` (not in the tab bar). */
type TabId = NavTabId | "ai" | "support";

function activeTabFromPathname(pathname: string): TabId {
  if (pathname === "/dashboard/ai") return "ai";
  if (pathname === "/dashboard/support") return "support";
  if (pathname.startsWith("/dashboard/payoff")) return "payoff";
  const fromTabs = TABS.find((t) => t.path === pathname)?.id;
  if (fromTabs) return fromTabs;
  return "home";
}

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
    0% { transform: scale(1) translateY(0); }
    40% { transform: scale(1.08) translateY(-2px); }
    100% { transform: scale(1) translateY(0); }
  `,
  support: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  `,
} satisfies Record<TabId, ReturnType<typeof keyframes>>;

const NAV_ANIM_MS = 0.42;
const NAV_ANIM_EASE = "cubic-bezier(0.34, 1.25, 0.64, 1)";

/** Desktop: logo (left) + tab row (center) + notifications & avatar (right). Mobile unchanged. */
function DesktopTopTabBar({
  activeTab,
  navBadgeCounts,
  onNavigate,
  bumpNavIcon,
  iconPulse,
  onSupportClick,
  onProfileMenuProfile,
  onProfileMenuNotifications,
  onProfileMenuSupport,
  onSignOut,
  user,
  loading,
}: {
  activeTab: TabId;
  navBadgeCounts: { credit: number };
  onNavigate: (path: string) => void;
  bumpNavIcon: (id: NavTabId) => void;
  iconPulse: Partial<Record<NavTabId, number>>;
  onSupportClick: () => void;
  onProfileMenuProfile: () => void;
  onProfileMenuNotifications: () => void;
  onProfileMenuSupport: () => void;
  onSignOut: () => void;
  user: BffUser | null;
  loading: boolean;
}) {
  // #region agent log
  if (typeof window !== "undefined" && window.location.pathname.includes("/dashboard/payoff/statements")) {
    const missingIcon = NAV_TABS.find((t) => t.Icon == null);
    fetch("http://127.0.0.1:7413/ingest/0e1d4fbe-df30-40db-abec-8444166ff922", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9265ef" },
      body: JSON.stringify({
        sessionId: "9265ef",
        location: "Dashboard.tsx:DesktopTopTabBar",
        message: "desktop tab bar render on statements path",
        data: {
          activeTab,
          missingIconTabId: missingIcon?.id ?? null,
          tabIds: NAV_TABS.map((t) => t.id),
        },
        timestamp: Date.now(),
        hypothesisId: "H4",
        runId: "pre",
      }),
    }).catch(() => {});
  }
  // #endregion
  const theme = useTheme();
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const accountMenuOpen = Boolean(accountMenuAnchor);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: "rgba(255, 255, 255, 0.82)",
        backdropFilter: OT.navBlur,
        WebkitBackdropFilter: OT.navBlur,
        borderBottom: "1px solid rgba(226, 232, 240, 0.65)",
        boxShadow: OT.navShadow,
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
          minHeight: 80,
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
          {NAV_TABS.map(({ id, label, path, Icon }) => {
            const active = activeTab === id;
            const navBadge = id === "credit" ? navBadgeCounts.credit : 0;
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
                    transition:
                      "color 0.22s ease, border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease",
                    "& .nav-tab-icon": {
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transformOrigin: "center center",
                      transition:
                        "transform 0.28s cubic-bezier(0.34, 1.25, 0.64, 1), color 0.22s ease, filter 0.22s ease",
                      color: "inherit",
                    },
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      borderColor: active ? "primary.main" : alpha(theme.palette.primary.main, 0.35),
                      color: "primary.main",
                      "& .nav-tab-icon": {
                        transform: "translateY(-2px) scale(1.08)",
                        filter: "drop-shadow(0 2px 6px rgba(26, 158, 143, 0.22))",
                      },
                    },
                    "&:active": {
                      "& .nav-tab-icon": {
                        transform: "translateY(0) scale(0.94)",
                        transition: "transform 0.12s cubic-bezier(0.34, 1.25, 0.64, 1)",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: { lg: 0.5, xl: 0.75 },
                      animation:
                        (iconPulse[id] ?? 0) > 0
                          ? `${navAnim[id]} ${NAV_ANIM_MS}s ${NAV_ANIM_EASE} both`
                          : "none",
                    }}
                  >
                    <Box component="span" className="nav-tab-icon" aria-hidden>
                      <Icon size={18} strokeWidth={1.85} />
                    </Box>
                    <Box component="span">{label}</Box>
                  </Box>
                </Button>
              </Badge>
            );
          })}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton onClick={onSupportClick} aria-label="Support" size="small" sx={{ color: NAV_MUTED }}>
            <Box
              component="span"
              className="material-symbols-outlined"
              sx={{ fontSize: 22, lineHeight: 1, userSelect: "none" }}
              aria-hidden
            >
              help
            </Box>
          </IconButton>
          <DashboardNotificationsButton size="medium" />
          <IconButton
            onClick={() => void onNavigate("/dashboard/account")}
            aria-label="Settings"
            size="small"
            sx={{ color: NAV_MUTED }}
          >
            <Box
              component="span"
              className="material-symbols-outlined"
              sx={{ fontSize: 22, lineHeight: 1, userSelect: "none" }}
              aria-hidden
            >
              settings
            </Box>
          </IconButton>
          <>
            <IconButton
              id="dashboard-account-menu-button"
              aria-controls={accountMenuOpen ? "dashboard-account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={accountMenuOpen ? "true" : undefined}
              onClick={(e) => setAccountMenuAnchor(e.currentTarget)}
              aria-label="Account menu"
              disabled={loading}
              size="small"
            >
              {loading ? (
                <Avatar sx={{ width: 36, height: 36, bgcolor: "action.hover" }} />
              ) : user ? (
                <BffUserAvatar picture={user.picture} name={user.name} email={user.email} size={36} />
              ) : (
                <BffUserAvatar picture={null} name={null} email={null} size={36} />
              )}
            </IconButton>
            <Menu
              id="dashboard-account-menu"
              anchorEl={accountMenuAnchor}
              open={accountMenuOpen}
              onClose={() => setAccountMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 232,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 10px 40px rgba(15, 23, 42, 0.12)",
                  },
                },
                list: {
                  dense: true,
                  "aria-labelledby": "dashboard-account-menu-button",
                  sx: { py: 0.5 },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAccountMenuAnchor(null);
                  onProfileMenuProfile();
                }}
                sx={{ py: 1.15, fontWeight: 600, fontSize: "0.875rem" }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: NAV_MUTED }}>
                  <User size={18} strokeWidth={1.85} />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAccountMenuAnchor(null);
                  onProfileMenuNotifications();
                }}
                sx={{ py: 1.15, fontWeight: 600, fontSize: "0.875rem" }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: NAV_MUTED }}>
                  <Bell size={18} strokeWidth={1.85} />
                </ListItemIcon>
                Notifications
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAccountMenuAnchor(null);
                  onProfileMenuSupport();
                }}
                sx={{ py: 1.15, fontWeight: 600, fontSize: "0.875rem" }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: NAV_MUTED }}>
                  <HelpCircle size={18} strokeWidth={1.85} />
                </ListItemIcon>
                Help &amp; Support
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  setAccountMenuAnchor(null);
                  onSignOut();
                }}
                sx={{ py: 1.15, fontWeight: 600, fontSize: "0.875rem", color: "error.main" }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
                  <LogOut size={18} strokeWidth={1.85} />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </>
        </Stack>
      </Box>
    </Box>
  );
}

function DashboardContent() {
  const theme = useTheme();
  const { plaidConnected } = useDashboardShell();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const location = useLocation();
  const isStatementsPage = location.pathname === "/dashboard/payoff/statements";
  const { state: bffState } = useBffAuth();
  const bffUser = bffState.status === "auth" ? bffState.user : null;
  const bffLoading = bffState.status === "loading";
  const activeTab = activeTabFromPathname(location.pathname);

  // #region agent log
  if (isStatementsPage) {
    fetch("http://127.0.0.1:7413/ingest/0e1d4fbe-df30-40db-abec-8444166ff922", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9265ef" },
      body: JSON.stringify({
        sessionId: "9265ef",
        location: "Dashboard.tsx:DashboardContent",
        message: "statements route: DashboardContent render",
        data: {
          pathname: location.pathname,
          activeTab,
          isStatementsPage,
          statementsExport: typeof StatementsPage,
        },
        timestamp: Date.now(),
        hypothesisId: "H1",
        runId: "pre",
      }),
    }).catch(() => {});
  }
  // #endregion

  const [iconPulse, setIconPulse] = useState<Partial<Record<NavTabId, number>>>({});
  const bumpNavIcon = useCallback((tabId: NavTabId) => {
    setIconPulse((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  }, []);

  const aiSendRef = useRef<((text: string) => void) | null>(null);

  const [navBadgeCounts, setNavBadgeCounts] = useState(() => initialNavBadges());

  useLayoutEffect(() => {
    if (!SHOW_CREDIT_BUILDER_IN_DASHBOARD && location.pathname === "/dashboard/credit") {
      void navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  useLayoutEffect(() => {
    if (!SHOW_CREDIT_BUILDER_IN_DASHBOARD) return;
    if (location.pathname === "/dashboard/credit") {
      markNavBadgeCleared(SS_NAV_CREDIT_CLEARED);
      setNavBadgeCounts((prev) => (prev.credit === 0 ? prev : { ...prev, credit: 0 }));
    }
  }, [location.pathname]);

  const bottomPad = "calc(72px + env(safe-area-inset-bottom, 0px))";

  /** Right rail for legacy AI only (no rail on Overview, Accounts, Credit Builder, Payments, or Statements). */
  const showRightRail =
    isDesktop &&
    !isStatementsPage &&
    activeTab !== "home" &&
    activeTab !== "account" &&
    activeTab !== "credit" &&
    activeTab !== "payoff" &&
    activeTab !== "support";

  const mainMaxWidthLg =
    activeTab === "home" ||
    activeTab === "account" ||
    activeTab === "credit" ||
    activeTab === "payoff" ||
    activeTab === "support"
      ? MAIN_MAX_OVERVIEW
      : MAIN_MAX_WITH_RAIL;

  function renderRightRail() {
    if (!showRightRail) return null;
    switch (activeTab) {
      case "ai":
        return (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Suggested prompts
            </Typography>
            <Stack spacing={1}>
              {(plaidConnected !== true ? AI_SUGGESTED_PROMPTS_PRE : AI_SUGGESTED_PROMPTS).map((s) => (
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
        navBadgeCounts={navBadgeCounts}
        onNavigate={(path) => {
          void navigate(path);
        }}
        bumpNavIcon={bumpNavIcon}
        iconPulse={iconPulse}
        onSupportClick={() => void navigate("/dashboard/support")}
        onProfileMenuProfile={() => void navigate("/dashboard/account?section=profile")}
        onProfileMenuNotifications={() => void navigate("/dashboard/account?section=notifications")}
        onProfileMenuSupport={() => void navigate("/dashboard/support")}
        onSignOut={() => void bffLogout()}
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
            bgcolor:
              activeTab === "home" ||
              activeTab === "account" ||
              activeTab === "credit" ||
              activeTab === "payoff" ||
              activeTab === "support"
                ? "#f7f9fb"
                : "background.default",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", lg: mainMaxWidthLg },
              px: { xs: 2, sm: 3, lg: 4 },
              py: { lg: 4 },
              pb: { xs: undefined, lg: 5 },
              display: "flex",
              flexDirection: "column",
              minHeight: { lg: "100%" },
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ flex: { lg: activeTab === "ai" ? 1 : "none" }, minHeight: { lg: activeTab === "ai" ? 0 : "auto" }, display: "flex", flexDirection: "column" }}>
              {activeTab === "account" ? (
                <AccountScreen />
              ) : activeTab === "ai" ? (
                <AiScreen sendMessageRef={aiSendRef} hideSuggestedChips />
              ) : activeTab === "support" ? (
                <SupportPage />
              ) : (
                <>
                  {activeTab === "home" && <HomeScreen />}
                  {activeTab === "payoff" && (isStatementsPage ? <StatementsPage /> : <PayoffScreen />)}
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
      <AppBar
        position="sticky"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: OT.navBlur,
          WebkitBackdropFilter: OT.navBlur,
          boxShadow: OT.navShadow,
        }}
      >
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
            <IconButton
              onClick={() => void navigate("/dashboard/support")}
              aria-label="Support"
              edge="end"
              size="small"
              sx={{ color: NAV_MUTED }}
            >
              <Box
                component="span"
                className="material-symbols-outlined"
                sx={{ fontSize: 22, lineHeight: 1, userSelect: "none" }}
                aria-hidden
              >
                help
              </Box>
            </IconButton>
            <DashboardNotificationsButton size="small" />
            <IconButton onClick={() => void navigate("/dashboard/account")} aria-label="Settings" edge="end" size="small" sx={{ color: NAV_MUTED }}>
              <Box component="span" className="material-symbols-outlined" sx={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
                settings
              </Box>
            </IconButton>
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
          bgcolor:
            activeTab === "home" ||
            activeTab === "account" ||
            activeTab === "credit" ||
            activeTab === "payoff" ||
            activeTab === "support"
              ? "#f7f9fb"
              : "background.default",
        }}
      >
        {activeTab === "account" ? (
          <AccountScreen />
        ) : activeTab === "ai" ? (
          <AiScreen />
        ) : activeTab === "support" ? (
          <SupportPage />
        ) : (
          <>
            {activeTab === "home" && <HomeScreen />}
            {activeTab === "payoff" && (isStatementsPage ? <StatementsPage /> : <PayoffScreen />)}
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
          value={
            activeTab === "ai" || activeTab === "support" || (!SHOW_CREDIT_BUILDER_IN_DASHBOARD && activeTab === "credit")
              ? false
              : activeTab
          }
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
          {NAV_TABS.map(({ id, label, Icon }) => {
            const pulse = iconPulse[id] ?? 0;
            const kf = navAnim[id];
            const navBadge = id === "credit" ? navBadgeCounts.credit : 0;
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
