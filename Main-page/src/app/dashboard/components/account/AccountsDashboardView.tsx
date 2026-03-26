import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ChevronRight } from "lucide-react";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { useLiveFinancialDisplay } from "../../hooks/useLiveFinancialDisplay";
import { displayMoney, FINANCIAL_MASK } from "../../lib/financialDisplay";
import { PlaidConnectButton } from "../plaid/PlaidConnectButton";
import { OVERVIEW_MOCK } from "../home/overview/overviewMock";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { ACCOUNTS_PAID_DOWN_CARDS } from "./accountsMock";

const money = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** Decorative image from Stitch `stich_account/code.html` */
const ACCOUNTS_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAFWoW-3_Y2J6x4MmGKoGLsY8sw8Myg4RSdSjJ-1cYoHWoixYT2MrPQX1m_GDPqwy7FwgyLp8QRYE6F88plewZVmUBqiLaYIgv8ZYQdqxS7T_fygTuL3z2HcK24RBP6q4KCLplYqjmh6Wnf9wgDzWpwJZZbyPAMqd1riH54jW92v95eYH3S_CBfOymTjWtG4DMXR6TtZ1KL9DtmHiTvcKhLsWO5AtpCP0OErDasakG0bZjIVjPV8_N_n8RPtst7j0ISpHO_6AzSdBA";

type SettingsNav = {
  onProfile: () => void;
  onNotifications: () => void;
  onSupport: () => void;
  onSignOut: () => void;
};

type Props = SettingsNav & {
  onManageConnections?: () => void;
};

function AccountsPageHeader() {
  return (
    <header style={{ marginBottom: "3rem" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: HEADLINE_FONT,
          fontSize: { xs: "2rem", md: "2.25rem" },
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: OT.onSurface,
          mb: 1,
        }}
      >
        Accounts
      </Typography>
      <Typography
        sx={{
          fontFamily: BODY_FONT,
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: OT.onSurfaceVariant,
        }}
      >
        Manage your connected bank account and the credit cards Buffer paid down.
      </Typography>
    </header>
  );
}

function PrimaryBankCard({
  plaidConnected,
  showLiveFinancials,
  onPlaidConnected,
}: {
  plaidConnected: boolean | null;
  showLiveFinancials: boolean;
  onPlaidConnected?: () => void | Promise<void>;
}) {
  const statusLoading = plaidConnected === null;
  const connected = plaidConnected === true;

  return (
    <Box
      id="accounts-primary-bank"
      sx={{
        borderRadius: "16px",
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        p: { xs: 3, md: 4 },
        mb: 5,
        transition: "transform 0.3s ease",
        "&:hover": { transform: "scale(1.01)" },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={3}
      >
        <Stack direction="row" alignItems="flex-start" spacing={3}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: OT.primaryFixed,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MsIcon name="account_balance" sx={{ fontSize: 30, color: OT.onPrimaryFixed }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", color: OT.onSurface }}>
                {OVERVIEW_MOCK.payment.bankLabel}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 9999,
                  bgcolor: OT.secondaryContainer,
                  color: OT.onSecondaryContainer,
                  fontFamily: BODY_FONT,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: connected ? OT.primary : statusLoading ? "#94a3b8" : "#f59e0b",
                  }}
                />
                {connected ? "Connected" : statusLoading ? "Checking…" : "Not connected"}
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", color: OT.onSurfaceVariant, mb: 0.5 }}>
              {showLiveFinancials ? `••••${OVERVIEW_MOCK.payment.bankMask}` : FINANCIAL_MASK}
            </Typography>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                fontSize: "0.8125rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: alpha(OT.onSurfaceVariant, 0.7),
              }}
            >
              Default payment account
            </Typography>
          </Box>
        </Stack>

        <Stack direction="column" alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
            Last updated: {OVERVIEW_MOCK.accountsUpdatedLabel}
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
            <PlaidConnectButton
              variant="contained"
              fullWidth={false}
              onConnected={onPlaidConnected}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 9999,
                textTransform: "none",
                fontWeight: 600,
                fontFamily: BODY_FONT,
                fontSize: "0.875rem",
                bgcolor: OT.surfaceContainerHigh,
                color: OT.onSurface,
                boxShadow: "none",
                "&:hover": { bgcolor: OT.surfaceContainer, boxShadow: "none" },
              }}
            >
              Reconnect
            </PlaidConnectButton>
            <PlaidConnectButton
              variant="contained"
              fullWidth={false}
              onConnected={onPlaidConnected}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 9999,
                textTransform: "none",
                fontWeight: 600,
                fontFamily: BODY_FONT,
                fontSize: "0.875rem",
                color: "#fff",
                boxShadow: `0 10px 24px ${alpha(OT.primary, 0.2)}`,
                background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${OT.primaryContainer} 0%, ${OT.primary} 100%)`,
                  boxShadow: `0 12px 28px ${alpha(OT.primary, 0.35)}`,
                },
              }}
            >
              Update Bank Account
            </PlaidConnectButton>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

function PaidDownCardRow({
  row,
  showLiveFinancials,
}: {
  row: (typeof ACCOUNTS_PAID_DOWN_CARDS)[number];
  showLiveFinancials: boolean;
}) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        transition: "background-color 0.2s ease",
        "&:hover": { bgcolor: OT.surfaceContainerLow },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: OT.surfaceContainerHigh,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MsIcon name="credit_card" sx={{ fontSize: 24, color: OT.onSurfaceVariant }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
              {row.name} {showLiveFinancials ? `••••${row.mask}` : FINANCIAL_MASK}
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 500, color: OT.onSurfaceVariant, mt: 0.25 }}>
              Original balance: {displayMoney(showLiveFinancials, () => money(row.originalBalance))}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 4, md: 6 }}
          sx={{
            alignSelf: { xs: "stretch", md: "center" },
            pl: { xs: 7, md: 0 },
            mt: { xs: 1, md: 0 },
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: OT.onSurfaceVariant,
                mb: 0.5,
              }}
            >
              Status
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center">
              <MsIcon name="check_circle" filled sx={{ fontSize: 18, color: OT.primary }} />
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600, color: OT.primary }}>
                Paid Down
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: OT.onSurfaceVariant,
                mb: 0.5,
              }}
            >
              Connection
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600, color: OT.onSurface }}>
              Connected
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

function ConnectionStatusCard({ onManageConnections }: { onManageConnections?: () => void }) {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        bgcolor: alpha(OT.primary, 0.05),
        p: 4,
        textAlign: "center",
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: alpha(OT.primaryFixedDim, 0.3),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <MsIcon name="sync" sx={{ fontSize: 32, color: OT.primary }} />
      </Box>
      <Typography
        sx={{
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: "1.125rem",
          lineHeight: 1.5,
          color: OT.onSurface,
          mb: 3,
        }}
      >
        All accounts connected and syncing normally.
      </Typography>
      <Button
        fullWidth
        variant="contained"
        onClick={onManageConnections}
        sx={{
          borderRadius: 9999,
          py: 1.5,
          textTransform: "none",
          fontWeight: 700,
          fontFamily: BODY_FONT,
          bgcolor: OT.surfaceContainerHighest,
          color: OT.onSurface,
          boxShadow: "none",
          "&:hover": { bgcolor: OT.surfaceContainerHigh, boxShadow: "none" },
        }}
      >
        Manage Connections
      </Button>
    </Box>
  );
}

function WhyThisMattersCard() {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        bgcolor: OT.surfaceContainerLow,
        border: `1px solid ${alpha(OT.outlineVariant, 0.35)}`,
        p: 4,
        mb: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <MsIcon name="info" sx={{ fontSize: 24, color: OT.tertiary }} />
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
          Why this matters
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.6, color: OT.onSurfaceVariant }}>
        Keeping your connected accounts up to date helps Buffer process payments smoothly and keep your information current. This ensures your
        credit score is updated accurately and your financial health is always visible.
      </Typography>
    </Box>
  );
}

function AccountsHeroImageCard() {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        aspectRatio: "16 / 9",
        boxShadow: "0 10px 40px rgba(15, 23, 42, 0.12)",
      }}
    >
      <Box
        component="img"
        src={ACCOUNTS_HERO_IMAGE}
        alt="Financial management"
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

function SettingsRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Stack
      component="button"
      type="button"
      onClick={onClick}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        width: "100%",
        minHeight: 0,
        py: 1.75,
        px: 0,
        border: "none",
        font: "inherit",
        cursor: "pointer",
        bgcolor: "transparent",
        textAlign: "left",
        borderBottom: `1px solid ${OT.surfaceContainer}`,
        "&:last-of-type": { borderBottom: "none" },
        "&:hover": { bgcolor: alpha(OT.primary, 0.04) },
      }}
    >
      <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: "0.9375rem", color: OT.onSurface }}>{label}</Typography>
      <ChevronRight size={18} color={OT.outline} aria-hidden />
    </Stack>
  );
}

function AccountSettingsCard({ onProfile, onNotifications, onSupport, onSignOut }: SettingsNav) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: `1px solid ${alpha(OT.outlineVariant, 0.35)}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        mt: 1,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
          Profile &amp; preferences
        </Typography>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, mt: 0.5 }}>
          Sign-in, notifications, and support
        </Typography>
      </Box>
      <Box sx={{ px: 2.5, pb: 2 }}>
        <SettingsRow label="Profile" onClick={onProfile} />
        <SettingsRow label="Notifications" onClick={onNotifications} />
        <SettingsRow label="Help &amp; Support" onClick={onSupport} />
        <SettingsRow label="Sign out" onClick={onSignOut} />
      </Box>
    </Card>
  );
}

export function AccountsDashboardView({
  onProfile,
  onNotifications,
  onSupport,
  onSignOut,
  onManageConnections,
}: Props) {
  const { plaidConnected, refreshPlaidConnection, refreshProfile } = useDashboardShell();
  const { showLiveFinancials } = useLiveFinancialDisplay();

  async function handlePlaidConnected() {
    await refreshPlaidConnection();
    await refreshProfile();
  }

  const scrollToBank = () => {
    document.getElementById("accounts-primary-bank")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(0, 1fr)" },
        gap: { xs: 3, lg: 5 },
        alignItems: "start",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <AccountsPageHeader />
        <PrimaryBankCard
          plaidConnected={plaidConnected}
          showLiveFinancials={showLiveFinancials}
          onPlaidConnected={handlePlaidConnected}
        />
        <Typography
          sx={{
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: "1.5rem",
            color: OT.onSurface,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Credit Cards Paid Down
        </Typography>
        <Stack spacing={2} sx={{ mb: 1 }}>
          {ACCOUNTS_PAID_DOWN_CARDS.map((row) => (
            <PaidDownCardRow key={`${row.name}-${row.mask}`} row={row} showLiveFinancials={showLiveFinancials} />
          ))}
        </Stack>
        <AccountSettingsCard
          onProfile={onProfile}
          onNotifications={onNotifications}
          onSupport={onSupport}
          onSignOut={onSignOut}
        />
      </Box>

      <Box sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 16 } }}>
        <ConnectionStatusCard onManageConnections={onManageConnections ?? scrollToBank} />
        <WhyThisMattersCard />
        <AccountsHeroImageCard />
      </Box>
    </Box>
  );
}
